import { Apierror } from '../utils/Apierror.js';
import { Apiresponse } from '../utils/Apiresponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import run from '../utils/gemini-vision.js';
import compressImage from '../utils/imageCompressor.js';
import { fileToGenerativePart } from '../utils/fileUtils.js';
import { extractMedicalData } from '../utils/gemini-vision.js';
import Patient from '../models/patient.model.js';
import Document from '../models/document.model.js';


const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new Apierror(400, "no doc uploaded");
    }

    const { buffer, mimetype, originalname, size } = req.file;
    const userId = req.user.id;

    try {
        const document = new Document({
            patientId: null,
            fileName: `${Date.now()}-${originalname}`,
            filePath: 'memory',
            fileType: req.body.fileType || 'prescription',
            processingStatus: false
        });

        await document.save();

        const generativePart = fileToGenerativePart(buffer, mimetype);
        const extractedData = await extractMedicalData(generativePart);
        let patient = await Patient.findOne({ userId });

        if (patient) {
            // Update existing patient
            patient.name = extractedData.name || patient.name;
            patient.age = extractedData.age || patient.age;
            patient.diseases = [...new Set([...patient.diseases, ...extractedData.diseases])];
            patient.medications = [...new Set([...patient.medications, ...extractedData.medications])];
            patient.allergies = [...new Set([...patient.allergies, ...extractedData.allergies])];
            patient.lastVisit = extractedData.lastVisit || patient.lastVisit;
            patient.docs.push(document._id);
        } else {
            // Create new patient
            patient = new Patient({
                userId,
                name: extractedData.name,
                age: extractedData.age,
                diseases: extractedData.diseases || [],
                medications: extractedData.medications || [],
                allergies: extractedData.allergies || [],
                lastVisit: extractedData.lastVisit,
                riskScore: 0, // laters baby
                docs: [document._id]
            });
        }

        await patient.save();

        document.patientId = userId;
        document.isProcessed = true;
        await document.save();

        res.status(200).json(
            new Apiresponse(
                200,
                {
                    patient: {
                        id: patientId,
                        name: patient.name,
                        age: patient.age,
                        diseases: patient.diseases,
                        medications: patient.medications,
                        lastVisit: patient.lastVisit,
                        riskScore: patient.riskScore
                    },
                    extractedData: extractedData,
                    documentId: document._id
                },
                'Document processed and patient persona updated successfully'
            )
        );
    } catch (error) {
        console.error('Error in document processing:', error);

        // Update document status to failed if it was created
        try {
            await Document.findByIdAndUpdate(document._id, {
                isProcessed: false,
                processingError: error.message
            });
        } catch (updateError) {
            console.error('Error updating document status:', updateError);
        }

        throw new Apierror(500, `Document processing failed: ${error.message}`);
    }
});

const getPatientPersona = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId }).populate('docs');

    if (!patient) {
        throw new Apierror(404, 'No patient record found');
    }

    res.status(200).json(
        new Apiresponse(
            200,
            { patient },
            'Patient persona retrieved successfully'
        )
    );
});

export { uploadDocument, getPatientPersona };





// const getResponse = asyncHandler(async (req, res) => {
// 	const {imageData } = req.body;
	
// 	//console.log('Image data', imageData);

// 	try {
// 		const compressedBase64Image = await compressImage(imageData);

// 		const responseFromRun = await run(
			
// 			compressedBase64Image
// 		);

// 		res
// 			.status(200)
// 			.json(
// 				new Apiresponse(
// 					200,
// 					{ response: responseFromRun },
// 					'Response from run function'
// 				)
// 			);
// 	} catch (error) {
// 		console.error('Error in run function:', error);
// 		res.status(500).json(new Apierror(500, 'Internal Server Error'));
// 	}
// });

// export { getResponse };
