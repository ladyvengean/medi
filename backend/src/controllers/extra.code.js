// import mongoose from 'mongoose';
// import { Apierror } from '../utils/Apierror.js';
// import { Apiresponse } from '../utils/Apiresponse.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import { extractMedicalData } from '../utils/gemini-vision.js';
// import { fileToGenerativePart } from '../utils/fileUtils.js';
// import Patient from '../models/patient.model.js';
// import Document from '../models/document.model.js';

// const uploadDocument = asyncHandler(async (req, res) => {
//     console.log('Upload request received');
    
//     if (!req.file) {
//         console.log('No file in request');
//         throw new Apierror(400, "No document uploaded");
//     }

//     const { buffer, mimetype, originalname, size } = req.file;
//     // Generate a unique userId for testing - in production, get from JWT
//     //if user exists then use their id, otherwise generate a random user id
//     const userId = req.user?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     console.log(`Processing file: ${originalname}, size: ${size}, type: ${mimetype}`);
//     console.log(`User ID: ${userId}`);

//     let document;
//     let tempPatient;
    
//     try {
//         // First, find or create patient to get proper ObjectId
//         let patient = await Patient.findOne({ userId });

//         if (!patient) {
//             // Create temporary patient first
//             tempPatient = new Patient({
//                 userId,
//                 name: 'Processing...',
//                 contact: '',
//                 persona: {
//                     diseases: { current: [], past: [] },
//                     medications: [],
//                     labs: [],
//                     doctors: [],
//                     allergies: [],
//                     lastUpdated: new Date()
//                 },
//                 riskPrediction: {
//                     score: 0,
//                     factors: [],
//                     lastUpdated: new Date()
//                 },
//                 docs: []
//             });
            
//             patient = await tempPatient.save();
//             console.log('Temporary patient created with ID:', patient._id);
//         }

//         // Create document record with proper ObjectId
//         document = new Document({
//             patientId: patient._id, // Use the actual ObjectId
//             fileName: `${Date.now()}-${originalname}`,
//             originalName: originalname,
//             filePath: 'memory',
//             fileSize: size,
//             mimeType: mimetype,
//             processingStatus: 'processing'
//         });

//         await document.save();
//         console.log('Document record created with ID:', document._id);

//         // Process with Gemini
//         const generativePart = fileToGenerativePart(buffer, mimetype);
//         console.log('Calling Gemini API...');
        
//         const extractedData = await extractMedicalData(generativePart);
//         console.log('Gemini response:', extractedData);

        
//         if (extractedData.error === "This is not a valid medical document.") {
//             console.log("Rejected: Not a medical document");
//             document.processingStatus = 'failed';
//             await document.save();

//             return res.status(400).json(
//                 new Apiresponse(400, null, "Uploaded file is not a valid medical document.")
//             );
//         }

//         const isEmptyMedicalData =
//         !extractedData.name &&
//         !extractedData.age &&
//         (!extractedData.diseases || extractedData.diseases.length === 0) &&
//         (!extractedData.medications || extractedData.medications.length === 0) &&
//         (!extractedData.allergies || extractedData.allergies.length === 0);

//         if (isEmptyMedicalData) {
//             console.log("Rejected: No meaningful medical data");
//             document.processingStatus = 'failed';
//             await document.save();

//             return res.status(400).json(
//                 new Apiresponse(400, null, "No medical information found. This doesn't appear to be a medical document.")
//             );
//         }




//         // Check if extraction failed
//         if (extractedData.error) {
//             throw new Error(extractedData.error);
//         }

//         // Update document with extracted data
//         document.extractedData = {
//             diseases: extractedData.diseases || [],
//             medications: extractedData.medications || [],
//             labs: [], // Not in Gemini response
//             doctors: [], // Not in Gemini response
//             allergies: extractedData.allergies || [],
//             rawText: '',
//             confidence: 0.9
//         };
//         document.processingStatus = 'completed';
//         document.processedAt = new Date();

//         // Update patient with extracted data
//         const currentDiseases = patient.persona.diseases.current || [];
//         const newDiseases = extractedData.diseases || [];
        
//         patient.persona.diseases.current = [...new Set([...currentDiseases, ...newDiseases])];
//         patient.persona.medications = [...new Set([...patient.persona.medications, ...(extractedData.medications || [])])];
//         patient.persona.allergies = [...new Set([...patient.persona.allergies || [], ...(extractedData.allergies || [])])];
//         patient.persona.lastUpdated = new Date();
        
//         // Add document ID to patient's docs array
//         if (!patient.docs.includes(document._id)) {
//             patient.docs.push(document._id);
//         }
        
//         // Update basic info if available
//         if (extractedData.name && extractedData.name !== 'Unknown') {
//             patient.name = extractedData.name;
//         }
//         if (extractedData.age) {
//             patient.age = extractedData.age;
//         }

//         // Save both document and patient
//         await Promise.all([
//             document.save(),
//             patient.save()
//         ]);

//         console.log('Patient and document updated successfully');

//         res.status(200).json(
//             new Apiresponse(
//                 200,
//                 {
//                     patient: {
//                         id: patient._id,
//                         name: patient.name,
//                         age: patient.age,
//                         contact: patient.contact,
//                         persona: patient.persona,
//                         riskPrediction: patient.riskPrediction
//                     },
//                     extractedData: extractedData,
//                     documentId: document._id
//                 },
//                 'Document processed and patient persona updated successfully'
//             )
//         );

//     } catch (error) {
//         console.error('Error in document processing:', error);

//         // Update document status to failed if it exists
//         if (document && document._id) {
//             try {
//                 await Document.findByIdAndUpdate(document._id, {
//                     processingStatus: 'failed',
//                     errorMessage: error.message
//                 });
//                 console.log('Document status updated to failed');
//             } catch (updateError) {
//                 console.error('Error updating document status:', updateError);
//             }
//         }

//         //{okay so its there to just mark the document : failed}
//         //we already did this document = new Document({...}); await document.save(); so if everything or anything fails later we need to make sure that That document isn’t just sitting there with a "processing" status forever and You mark it as "failed" and You also add the errorMessage so devs/admins can debug later

//         // Remove temporary patient if created and processing failed
//         if (tempPatient && tempPatient._id) {
//             try {
//                 await Patient.findByIdAndDelete(tempPatient._id);
//                 console.log('Temporary patient removed due to processing failure');
//             } catch (deleteError) {
//                 console.error('Error deleting temporary patient:', deleteError);
//             }
//         }

// //         { So why delete the temporary patient?
// // Because it was:
// // Only created for this document
// // Not connected to a real user yet
// // Just a placeholder
// // So if the document didn’t go through, you don’t want junk temp patients sitting in your database.
// // 💡 This prevents garbage data and keeps your Patient collection clean. }

//         // Send proper error response
//         res.status(500).json(
//             new Apiresponse(
//                 500,
//                 null,
//                 `Document processing failed: ${error.message}`
//             )
//         );
//     }
// });

// const getPatientPersona = asyncHandler(async (req, res) => {
//     const userId = req.user?.id || req.query.userId || 'default-user';
//     console.log('Fetching patient for userId:', userId);

//     try {
//         const patient = await Patient.findOne({ userId }).populate('docs');

//         if (!patient) {
//             return res.status(404).json(
//                 new Apiresponse(404, null, 'No patient record found')
//             );
//         }

//         res.status(200).json(
//             new Apiresponse(200, { patient }, 'Patient persona retrieved successfully')
//         );
//     } catch (error) {
//         console.error('Error fetching patient:', error);
//         res.status(500).json(
//             new Apiresponse(500, null, 'Failed to fetch patient data')
//         );
//     }
// });

// // New route to get all patients (for testing)
// const getAllPatients = asyncHandler(async (req, res) => {
//     try {
//         const patients = await Patient.find().populate('docs').sort({ createdAt: -1 });
        
//         res.status(200).json(
//             new Apiresponse(200, { patients, count: patients.length }, 'All patients retrieved successfully')
//         );
//     } catch (error) {
//         console.error('Error fetching all patients:', error);
//         res.status(500).json(
//             new Apiresponse(500, null, 'Failed to fetch patients data')
//         );
//     }
// });

// export { uploadDocument, getPatientPersona, getAllPatients };

// import mongoose from 'mongoose';
// import { Apierror } from '../utils/Apierror.js';
// import { Apiresponse } from '../utils/Apiresponse.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import { extractMedicalData } from '../utils/gemini-vision.js';
// import { fileToGenerativePart } from '../utils/fileUtils.js';
// import Patient from '../models/patient.model.js';
// import Document from '../models/document.model.js';

// const uploadDocument = asyncHandler(async (req, res) => {
//     console.log('Upload request received');
    
//     if (!req.file) {
//         console.log('No file in request');
//         throw new Apierror(400, "No document uploaded");
//     }

//     const { buffer, mimetype, originalname, size } = req.file;
//     // Generate a unique userId for testing - in production, get from JWT
//     //if user exists then use their id, otherwise generate a random user id
//     const userId = req.user?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     console.log(`Processing file: ${originalname}, size: ${size}, type: ${mimetype}`);
//     console.log(`User ID: ${userId}`);

//     let document;
//     let tempPatient;
    
//     try {
//         // First, find or create patient to get proper ObjectId
//         let patient = await Patient.findOne({ userId });

//         if (!patient) {
//             // Create temporary patient first
//             tempPatient = new Patient({
//                 userId,
//                 name: 'Processing...',
//                 contact: '',
//                 persona: {
//                     diseases: { current: [], past: [] },
//                     medications: [],
//                     labs: [],
//                     doctors: [],
//                     allergies: [],
//                     lastUpdated: new Date()
//                 },
//                 riskPrediction: {
//                     score: 0,
//                     factors: [],
//                     lastUpdated: new Date()
//                 },
//                 docs: []
//             });
            
//             patient = await tempPatient.save();
//             console.log('Temporary patient created with ID:', patient._id);
//         }

//         // Create document record with proper ObjectId
//         document = new Document({
//             patientId: patient._id, // Use the actual ObjectId
//             fileName: `${Date.now()}-${originalname}`,
//             originalName: originalname,
//             filePath: 'memory',
//             fileSize: size,
//             mimeType: mimetype,
//             processingStatus: 'processing'
//         });

//         await document.save();
//         console.log('Document record created with ID:', document._id);

//         // Process with Gemini
//         const generativePart = fileToGenerativePart(buffer, mimetype);
//         console.log('Calling Gemini API...');
        
//         const extractedData = await extractMedicalData(generativePart);
//         console.log('Gemini response:', extractedData);

        
//         if (extractedData.error === "This is not a valid medical document.") {
//             console.log("Rejected: Not a medical document");
//             document.processingStatus = 'failed';
//             await document.save();

//             return res.status(400).json(
//                 new Apiresponse(400, null, "Uploaded file is not a valid medical document.")
//             );
//         }

//         const isEmptyMedicalData =
//         !extractedData.name &&
//         !extractedData.age &&
//         (!extractedData.diseases || extractedData.diseases.length === 0) &&
//         (!extractedData.medications || extractedData.medications.length === 0) &&
//         (!extractedData.allergies || extractedData.allergies.length === 0);

//         if (isEmptyMedicalData) {
//             console.log("Rejected: No meaningful medical data");
//             document.processingStatus = 'failed';
//             await document.save();

//             return res.status(400).json(
//                 new Apiresponse(400, null, "No medical information found. This doesn't appear to be a medical document.")
//             );
//         }




//         // Check if extraction failed
//         if (extractedData.error) {
//             throw new Error(extractedData.error);
//         }

//         // Update document with extracted data
//         document.extractedData = {
//             diseases: extractedData.diseases || [],
//             medications: extractedData.medications || [],
//             labs: [], // Not in Gemini response
//             doctors: [], // Not in Gemini response
//             allergies: extractedData.allergies || [],
//             rawText: '',
//             confidence: 0.9
//         };
//         document.processingStatus = 'completed';
//         document.processedAt = new Date();

//         // Update patient with extracted data
//         const currentDiseases = patient.persona.diseases.current || [];
//         const newDiseases = extractedData.diseases || [];
        
//         patient.persona.diseases.current = [...new Set([...currentDiseases, ...newDiseases])];
//         patient.persona.medications = [...new Set([...patient.persona.medications, ...(extractedData.medications || [])])];
//         patient.persona.allergies = [...new Set([...patient.persona.allergies || [], ...(extractedData.allergies || [])])];
//         patient.persona.lastUpdated = new Date();
        
//         // Add document ID to patient's docs array
//         if (!patient.docs.includes(document._id)) {
//             patient.docs.push(document._id);
//         }
        
//         // Update basic info if available
//         if (extractedData.name && extractedData.name !== 'Unknown') {
//             patient.name = extractedData.name;
//         }
//         if (extractedData.age) {
//             patient.age = extractedData.age;
//         }

//         // Save both document and patient
//         await Promise.all([
//             document.save(),
//             patient.save()
//         ]);

//         console.log('Patient and document updated successfully');

//         res.status(200).json(
//             new Apiresponse(
//                 200,
//                 null,
//                 'Document uploaded to database and processed successfully'
//             )
//         );

//     } catch (error) {
//         console.error('Error in document processing:', error);

//         // Update document status to failed if it exists
//         if (document && document._id) {
//             try {
//                 await Document.findByIdAndUpdate(document._id, {
//                     processingStatus: 'failed',
//                     errorMessage: error.message
//                 });
//                 console.log('Document status updated to failed');
//             } catch (updateError) {
//                 console.error('Error updating document status:', updateError);
//             }
//         }

//         //{okay so its there to just mark the document : failed}
//         //we already did this document = new Document({...}); await document.save(); so if everything or anything fails later we need to make sure that That document isn't just sitting there with a "processing" status forever and You mark it as "failed" and You also add the errorMessage so devs/admins can debug later

//         // Remove temporary patient if created and processing failed
//         if (tempPatient && tempPatient._id) {
//             try {
//                 await Patient.findByIdAndDelete(tempPatient._id);
//                 console.log('Temporary patient removed due to processing failure');
//             } catch (deleteError) {
//                 console.error('Error deleting temporary patient:', deleteError);
//             }
//         }

// //         { So why delete the temporary patient?
// // Because it was:
// // Only created for this document
// // Not connected to a real user yet
// // Just a placeholder
// // So if the document didn't go through, you don't want junk temp patients sitting in your database.
// // 💡 This prevents garbage data and keeps your Patient collection clean. }

//         // Send proper error response
//         res.status(500).json(
//             new Apiresponse(
//                 500,
//                 null,
//                 `Document processing failed: ${error.message}`
//             )
//         );
//     }
// });

// const getPatientPersona = asyncHandler(async (req, res) => {
//     const userId = req.user?.id || req.query.userId || 'default-user';
//     console.log('Fetching patient for userId:', userId);

//     try {
//         const patient = await Patient.findOne({ userId }).populate('docs');

//         if (!patient) {
//             return res.status(404).json(
//                 new Apiresponse(404, null, 'No patient record found')
//             );
//         }

//         // Generate clean patient summary
//         const patientSummary = {
//             name: patient.name,
//             age: patient.age,
//             contact: patient.contact,
//             lastUpdated: patient.persona.lastUpdated,
//             medicalSummary: {
//                 currentConditions: patient.persona.diseases.current.length > 0 
//                     ? patient.persona.diseases.current 
//                     : ["No current conditions recorded"],
//                 medications: patient.persona.medications.length > 0 
//                     ? patient.persona.medications 
//                     : ["No medications recorded"],
//                 allergies: patient.persona.allergies.length > 0 
//                     ? patient.persona.allergies 
//                     : ["No allergies recorded"]
//             },
//             riskAssessment: {
//                 score: patient.riskPrediction.score,
//                 level: getRiskLevel(patient.riskPrediction.score),
//                 factors: patient.riskPrediction.factors.length > 0 
//                     ? patient.riskPrediction.factors 
//                     : ["No significant risk factors identified"]
//             },
//             documentsProcessed: patient.docs.length
//         };

//         res.status(200).json(
//             new Apiresponse(200, patientSummary, 'Patient data retrieved successfully')
//         );
//     } catch (error) {
//         console.error('Error fetching patient:', error);
//         res.status(500).json(
//             new Apiresponse(500, null, 'Failed to fetch patient data')
//         );
//     }
// });

// // New route to get all patients (for testing)
// const getAllPatients = asyncHandler(async (req, res) => {
//     try {
//         const patients = await Patient.find().populate('docs').sort({ createdAt: -1 });
        
//         res.status(200).json(
//             new Apiresponse(200, { patients, count: patients.length }, 'All patients retrieved successfully')
//         );
//     } catch (error) {
//         console.error('Error fetching all patients:', error);
//         res.status(500).json(
//             new Apiresponse(500, null, 'Failed to fetch patients data')
//         );
//     }
// });

// // Helper function for risk level
// function getRiskLevel(score) {
//     if (score <= 2) return "Low";
//     if (score <= 5) return "Moderate"; 
//     if (score <= 8) return "High";
//     return "Very High";
// }

// export { uploadDocument, getPatientPersona, getAllPatients };
