
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
    
    // FIXED: Proper user ID handling
    const userId = req.user?._id?.toString();
    if (!userId) {
        throw new Apierror(401, "User authentication required");
    }

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

        if (extractedData.error === "This is not a valid medical document.") {
            console.log("Rejected: Not a medical document");
            document.processingStatus = 'failed';
            await document.save();

            return res.status(400).json(
                new Apiresponse(400, null, "Uploaded file is not a valid medical document.")
            );
        }

        const isEmptyMedicalData =
            !extractedData.name &&
            !extractedData.age &&
            (!extractedData.diseases || extractedData.diseases.length === 0) &&
            (!extractedData.medications || extractedData.medications.length === 0) &&
            (!extractedData.allergies || extractedData.allergies.length === 0);

        if (isEmptyMedicalData) {
            console.log("Rejected: No meaningful medical data");
            document.processingStatus = 'failed';
            await document.save();

            return res.status(400).json(
                new Apiresponse(400, null, "No medical information found. This doesn't appear to be a medical document.")
            );
        }

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

        // Update basic info if available and valid
        if (extractedData.name && extractedData.name !== 'Unknown' && extractedData.name.trim() !== '') {
            patient.name = extractedData.name;
        }
        if (extractedData.age && extractedData.age > 0) {
            patient.age = extractedData.age;
        }

        // Calculate and update risk prediction
        const riskScore = calculateRiskScore(patient.persona);
        patient.riskPrediction = {
            score: riskScore,
            factors: getRiskFactors(patient.persona),
            lastUpdated: new Date()
        };

        // Save both document and patient
        await Promise.all([
            document.save(),
            patient.save()
        ]);

        console.log('Patient and document updated successfully');
        console.log('Updated patient data:', {
            name: patient.name,
            diseases: patient.persona.diseases.current,
            medications: patient.persona.medications,
            allergies: patient.persona.allergies
        });
        console.log("patient.userId:", patient.userId);
        console.log("documentsProcessed:", patient.docs.length);

        const updatedPatient = await Patient.findById(patient._id); // make sure it's saved

        // FIXED: Return proper response with userId
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Document uploaded to database and processed successfully',
            data: {
                userId: String(patient.userId), // Ensure it's a string
                documentsProcessed: patient.docs.length,
            }
        });

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

        //{okay so its there to just mark the document : failed}
        //we already did this document = new Document({...}); await document.save(); so if everything or anything fails later we need to make sure that That document isn't just sitting there with a "processing" status forever and You mark it as "failed" and You also add the errorMessage so devs/admins can debug later

        // Remove temporary patient if created and processing failed
        if (tempPatient && tempPatient._id) {
            try {
                await Patient.findByIdAndDelete(tempPatient._id);
                console.log('Temporary patient removed due to processing failure');
            } catch (deleteError) {
                console.error('Error deleting temporary patient:', deleteError);
            }
        }

        //         { So why delete the temporary patient?
        // Because it was:
        // Only created for this document
        // Not connected to a real user yet
        // Just a placeholder
        // So if the document didn't go through, you don't want junk temp patients sitting in your database.
        // 💡 This prevents garbage data and keeps your Patient collection clean. }

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
    // FIXED: Get userId from authenticated user first, then fallback to query param
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
        return res.status(400).json(
            new Apiresponse(400, null, 'User ID is required')
        );
    }
    
    console.log('Fetching patient for userId:', userId);

    try {
        const patient = await Patient.findOne({ userId }).populate('docs');

        if (!patient) {
            return res.status(404).json(
                new Apiresponse(404, null, 'No patient record found')
            );
        }

        console.log('Found patient data:', {
            name: patient.name,
            diseases: patient.persona.diseases.current,
            medications: patient.persona.medications,
            allergies: patient.persona.allergies
        });

        // FIXED: Generate clean patient summary matching frontend expectations
        const patientSummary = {
            name: patient.name,
            age: patient.age,
            contact: patient.contact,
            lastUpdated: patient.persona.lastUpdated,
            // FIXED: Map to frontend expected structure
            currentConditions: patient.persona.diseases.current.length > 0
                ? patient.persona.diseases.current
                : ["No current conditions recorded"],
            medications: patient.persona.medications.length > 0
                ? patient.persona.medications
                : ["No medications recorded"],
            allergies: patient.persona.allergies.length > 0
                ? patient.persona.allergies
                : ["No allergies recorded"],
            riskAssessment: {
                score: patient.riskPrediction.score,
                riskLevel: getRiskLevel(patient.riskPrediction.score),
                riskFactors: patient.riskPrediction.factors.length > 0
                    ? patient.riskPrediction.factors
                    : ["No significant risk factors identified"]
            },
            documentsProcessed: patient.docs.length
        };

        res.status(200).json(
            new Apiresponse(200, patientSummary, 'Patient data retrieved successfully')
        );
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json(
            new Apiresponse(500, null, 'Failed to fetch patient data')
        );
    }
});

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

// ADDED: Function to create patient on user registration
const createPatientOnRegistration = asyncHandler(async (userId, userData = {}) => {
    try {
        const existingPatient = await Patient.findOne({ userId });
        if (existingPatient) {
            return existingPatient;
        }

        const newPatient = new Patient({
            userId,
            name: userData.name || 'New Patient',
            contact: userData.email || userData.contact || '',
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

        return await newPatient.save();
    } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
    }
});

// Helper function for risk level
function getRiskLevel(score) {
    if (score <= 2) return "Low";
    if (score <= 5) return "Moderate";
    if (score <= 8) return "High";
    return "Very High";
}

// Helper function to calculate risk score
function calculateRiskScore(persona) {
    let score = 0;

    // Add points based on conditions
    score += persona.diseases.current.length * 2;
    score += persona.diseases.past.length * 1;
    score += persona.medications.length * 1;
    score += persona.allergies.length * 0.5;

    // Cap at 10
    return Math.min(score, 10);
}

// Helper function to get risk factors
function getRiskFactors(persona) {
    const factors = [];

    if (persona.diseases.current.length > 0) {
        factors.push(`${persona.diseases.current.length} active condition(s)`);
    }

    if (persona.medications.length > 3) {
        factors.push("Multiple medications");
    }

    if (persona.allergies.length > 0) {
        factors.push(`${persona.allergies.length} known allergy(ies)`);
    }

    return factors.length > 0 ? factors : ["No significant risk factors identified"];
}

export { uploadDocument, getPatientPersona, getAllPatients, createPatientOnRegistration };