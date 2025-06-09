import mongoose from 'mongoose';
import { Apierror } from '../utils/Apierror.js';
import { Apiresponse } from '../utils/Apiresponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractMedicalData } from '../utils/gemini-vision.js';
import { fileToGenerativePart } from '../utils/fileUtils.js';
import Patient from '../models/patient.model.js';
import Document from '../models/document.model.js';

const uploadDocument = asyncHandler(async (req, res) => {
    console.log('Upload request received');
    
    if (!req.file) {
        console.log('No file in request');
        throw new Apierror(400, "No document uploaded");
    }

    const { buffer, mimetype, originalname, size } = req.file;
    // Generate a unique userId for testing - in production, get from JWT
    const userId = req.user?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Processing file: ${originalname}, size: ${size}, type: ${mimetype}`);
    console.log(`User ID: ${userId}`);

    let document;
    let tempPatient;
    
    try {
        // First, find or create patient to get proper ObjectId
        let patient = await Patient.findOne({ userId });

        if (!patient) {
            // Create temporary patient first
            tempPatient = new Patient({
                userId,
                name: 'Processing...',
                contact: '',
                persona: {
                    diseases: { current: [], past: [] },
                    medications: [],
                    labs: [],
                    doctors: [],
                    allergies: [],
                    lastUpdated: new Date()
                },
                riskPrediction: {
                    score: 0,
                    factors: [],
                    lastUpdated: new Date()
                },
                docs: []
            });
            
            patient = await tempPatient.save();
            console.log('Temporary patient created with ID:', patient._id);
        }

        // Create document record with proper ObjectId
        document = new Document({
            patientId: patient._id, // Use the actual ObjectId
            fileName: `${Date.now()}-${originalname}`,
            originalName: originalname,
            filePath: 'memory',
            fileSize: size,
            mimeType: mimetype,
            processingStatus: 'processing'
        });

        await document.save();
        console.log('Document record created with ID:', document._id);

        // Process with Gemini
        const generativePart = fileToGenerativePart(buffer, mimetype);
        console.log('Calling Gemini API...');
        
        const extractedData = await extractMedicalData(generativePart);
        console.log('Gemini response:', extractedData);

        // Check if extraction failed
        if (extractedData.error) {
            throw new Error(extractedData.error);
        }

        // Update document with extracted data
        document.extractedData = {
            diseases: extractedData.diseases || [],
            medications: extractedData.medications || [],
            labs: [], // Not in Gemini response
            doctors: [], // Not in Gemini response
            allergies: extractedData.allergies || [],
            rawText: '',
            confidence: 0.9
        };
        document.processingStatus = 'completed';
        document.processedAt = new Date();

        // Update patient with extracted data
        const currentDiseases = patient.persona.diseases.current || [];
        const newDiseases = extractedData.diseases || [];
        
        patient.persona.diseases.current = [...new Set([...currentDiseases, ...newDiseases])];
        patient.persona.medications = [...new Set([...patient.persona.medications, ...(extractedData.medications || [])])];
        patient.persona.allergies = [...new Set([...patient.persona.allergies || [], ...(extractedData.allergies || [])])];
        patient.persona.lastUpdated = new Date();
        
        // Add document ID to patient's docs array
        if (!patient.docs.includes(document._id)) {
            patient.docs.push(document._id);
        }
        
        // Update basic info if available
        if (extractedData.name && extractedData.name !== 'Unknown') {
            patient.name = extractedData.name;
        }
        if (extractedData.age) {
            patient.age = extractedData.age;
        }

        // Save both document and patient
        await Promise.all([
            document.save(),
            patient.save()
        ]);

        console.log('Patient and document updated successfully');

        res.status(200).json(
            new Apiresponse(
                200,
                {
                    patient: {
                        id: patient._id,
                        name: patient.name,
                        age: patient.age,
                        contact: patient.contact,
                        persona: patient.persona,
                        riskPrediction: patient.riskPrediction
                    },
                    extractedData: extractedData,
                    documentId: document._id
                },
                'Document processed and patient persona updated successfully'
            )
        );

    } catch (error) {
        console.error('Error in document processing:', error);

        // Update document status to failed if it exists
        if (document && document._id) {
            try {
                await Document.findByIdAndUpdate(document._id, {
                    processingStatus: 'failed',
                    errorMessage: error.message
                });
                console.log('Document status updated to failed');
            } catch (updateError) {
                console.error('Error updating document status:', updateError);
            }
        }

        // Remove temporary patient if created and processing failed
        if (tempPatient && tempPatient._id) {
            try {
                await Patient.findByIdAndDelete(tempPatient._id);
                console.log('Temporary patient removed due to processing failure');
            } catch (deleteError) {
                console.error('Error deleting temporary patient:', deleteError);
            }
        }

        // Send proper error response
        res.status(500).json(
            new Apiresponse(
                500,
                null,
                `Document processing failed: ${error.message}`
            )
        );
    }
});

const getPatientPersona = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.query.userId || 'default-user';
    console.log('Fetching patient for userId:', userId);

    try {
        const patient = await Patient.findOne({ userId }).populate('docs');

        if (!patient) {
            return res.status(404).json(
                new Apiresponse(404, null, 'No patient record found')
            );
        }

        res.status(200).json(
            new Apiresponse(200, { patient }, 'Patient persona retrieved successfully')
        );
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json(
            new Apiresponse(500, null, 'Failed to fetch patient data')
        );
    }
});

// New route to get all patients (for testing)
const getAllPatients = asyncHandler(async (req, res) => {
    try {
        const patients = await Patient.find().populate('docs').sort({ createdAt: -1 });
        
        res.status(200).json(
            new Apiresponse(200, { patients, count: patients.length }, 'All patients retrieved successfully')
        );
    } catch (error) {
        console.error('Error fetching all patients:', error);
        res.status(500).json(
            new Apiresponse(500, null, 'Failed to fetch patients data')
        );
    }
});

export { uploadDocument, getPatientPersona, getAllPatients };
// import fs from 'fs';
// import path from 'path';

// // Upload document controller
// const uploadDocument = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false,
//         message: "No file uploaded" 
//       });
//     }

//     console.log('File uploaded:', req.file);

//     // Here you would process the file with your medical document analysis
//     // You could integrate with Google's Gemini API, OCR, or other AI services
    
//     // Mock response for now - replace with actual processing
//     const mockResponse = {
//       success: true,
//       message: "Document uploaded and processed successfully",
//       data: {
//         filename: req.file.originalname,
//         fileSize: req.file.size,
//         mimeType: req.file.mimetype,
//         uploadPath: req.file.path,
//         // Mock medical data extraction
//         extractedData: {
//           patientName: "John Doe",
//           age: "35",
//           medication: "Amoxicillin 500mg",
//           dosage: "3 times daily",
//           duration: "7 days",
//           diagnosis: "Upper respiratory infection",
//           doctorName: "Dr. Smith"
//         }
//       }
//     };

//     res.status(200).json(mockResponse);
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: error.message || "Upload failed" 
//     });
//   }
// };

// // Get patient persona controller
// const getPatientPersona = async (req, res) => {
//   try {
//     // Mock patient data - replace with actual database query
//     const mockPatientData = {
//       success: true,
//       message: "Patient data retrieved successfully",
//       data: {
//         patients: [
//           {
//             id: 1,
//             name: "John Doe",
//             age: 35,
//             gender: "Male",
//             lastVisit: "2024-06-01",
//             medications: [
//               {
//                 name: "Amoxicillin",
//                 dosage: "500mg",
//                 frequency: "3 times daily",
//                 duration: "7 days"
//               },
//               {
//                 name: "Ibuprofen",
//                 dosage: "200mg",
//                 frequency: "As needed",
//                 duration: "PRN"
//               }
//             ],
//             conditions: ["Upper respiratory infection", "Mild inflammation"],
//             allergies: ["Penicillin"],
//             vitals: {
//               bloodPressure: "120/80",
//               heartRate: "72 bpm",
//               temperature: "98.6°F"
//             }
//           },
//           {
//             id: 2,
//             name: "Jane Smith",
//             age: 28,
//             gender: "Female",
//             lastVisit: "2024-06-05",
//             medications: [
//               {
//                 name: "Metformin",
//                 dosage: "500mg",
//                 frequency: "Twice daily",
//                 duration: "Ongoing"
//               }
//             ],
//             conditions: ["Type 2 Diabetes"],
//             allergies: ["None known"],
//             vitals: {
//               bloodPressure: "118/75",
//               heartRate: "68 bpm",
//               temperature: "98.4°F"
//             }
//           }
//         ],
//         totalPatients: 2
//       }
//     };

//     res.status(200).json(mockPatientData);
//   } catch (error) {
//     console.error('Patient data error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to fetch patient data" 
//     });
//   }
// };

// export {
//   uploadDocument,
//   getPatientPersona
// };