import mongoose from 'mongoose';
import { Apierror } from '../utils/Apierror.js';
import { Apiresponse } from '../utils/Apiresponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { extractMedicalData } from '../utils/gemini-vision.js';
import { fileToGenerativePart } from '../utils/fileUtils.js';
import User from '../models/user.models.js';
import Document from '../models/document.model.js';

const uploadDocument = asyncHandler(async (req, res) => {
    console.log('Upload request received');

    if (!req.file) {
        console.log('No file in request');
        throw new Apierror(400, "No document uploaded");
    }

    const { buffer, mimetype, originalname, size } = req.file;
    
    // Get user ID from authenticated user
    const userId = req.user?._id?.toString();
    if (!userId) {
        throw new Apierror(401, "User authentication required");
    }

    console.log(`Processing file: ${originalname}, size: ${size}, type: ${mimetype}`);
    console.log(`User ID: ${userId}`);

    let document;

    try {
        // Find the authenticated user
        let user = await User.findById(userId);

        if (!user) {
            throw new Apierror(404, "User not found");
        }

        // Initialize persona if it doesn't exist
        if (!user.persona) {
            user.persona = {
                name: user.name || '',
                age: null,
                diseases: [],
                medications: [],
                allergies: [],
                lastVisit: null
            };
        }

        // Create document record
        document = new Document({
            userId: user._id,
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

        // Map Gemini response fields correctly
        const conditions = extractedData.currentConditions || [];
        const medications = extractedData.medications || [];
        const allergies = extractedData.allergies || [];

        const isEmptyMedicalData =
            !extractedData.name &&
            !extractedData.age &&
            conditions.length === 0 &&
            medications.length === 0 &&
            allergies.length === 0;

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

        // Update document with extracted data - store the full structured data
        document.extractedData = {
            diseases: conditions,
            medications: medications,
            allergies: allergies,
            rawText: '',
            confidence: 0.9,
            fullData: extractedData // Store complete Gemini response for future use
        };
        document.processingStatus = 'completed';
        document.processedAt = new Date();

        // Update user persona with extracted data
        const currentDiseases = user.persona.diseases || [];
        const newDiseases = conditions.filter(condition => 
            condition && condition !== 'Not specified' && condition.trim() !== ''
        );

        const newMedications = medications.filter(medication => 
            medication && medication !== 'Not specified' && medication.trim() !== ''
        );

        const newAllergies = allergies.filter(allergy => 
            allergy && allergy !== 'Not specified' && allergy.trim() !== ''
        );

        // Only add non-empty values to avoid "Not specified" entries
        user.persona.diseases = [...new Set([...currentDiseases, ...newDiseases])];
        user.persona.medications = [...new Set([...user.persona.medications || [], ...newMedications])];
        user.persona.allergies = [...new Set([...user.persona.allergies || [], ...newAllergies])];
        user.persona.lastVisit = extractedData.visitInfo?.visitDate || new Date().toISOString();

        // Update basic info if available and valid
        if (extractedData.name && extractedData.name !== 'Not specified' && extractedData.name.trim() !== '') {
            user.persona.name = extractedData.name;
        }
        if (extractedData.age && extractedData.age !== 'Not specified' && !isNaN(extractedData.age)) {
            user.persona.age = extractedData.age;
        }

        // Store additional structured data in persona for richer profile
        user.persona.vitals = extractedData.vitals || {};
        user.persona.labResults = extractedData.labResults || {};
        user.persona.diagnosis = extractedData.diagnosis || {};
        user.persona.treatmentPlan = extractedData.treatmentPlan || {};
        user.persona.visitInfo = extractedData.visitInfo || {};
        user.persona.riskAssessment = extractedData.riskAssessment || {};
        user.persona.documentSummary = extractedData.documentSummary || {};

        // Save both document and user with better error handling
        try {
            await Promise.all([
                document.save(),
                user.save()
            ]);
            
            console.log('✅ User persona and document saved to database successfully');
            console.log('✅ Updated user data:', {
                name: user.persona.name,
                diseases: user.persona.diseases,
                medications: user.persona.medications,
                allergies: user.persona.allergies,
                vitals: user.persona.vitals,
                diagnosis: user.persona.diagnosis
            });
            
            // Verify the save by fetching the user again
            const savedUser = await User.findById(userId);
            console.log('✅ Verified saved data in database:', {
                diseases: savedUser.persona.diseases,
                medications: savedUser.persona.medications,
                allergies: savedUser.persona.allergies
            });
            
        } catch (saveError) {
            console.error('❌ Error saving to database:', saveError);
            throw new Error(`Database save failed: ${saveError.message}`);
        }

        // Return proper response with userId
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Document uploaded and processed successfully',
            data: {
                userId: String(user._id),
                documentsProcessed: 1, // We just processed one document
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

const getUserPersona = asyncHandler(async (req, res) => {
    // Get userId from URL parameter first, then authenticated user, then query param
    const userId = req.params.id || req.user?._id || req.query.userId;
    
    if (!userId) {
        return res.status(400).json(
            new Apiresponse(400, null, 'User ID is required')
        );
    }
    
    console.log('Fetching user for userId:', userId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(
                new Apiresponse(404, null, 'User not found')
            );
        }

        // Initialize persona if it doesn't exist
        const persona = user.persona || {
            name: user.name || '',
            age: null,
            diseases: [],
            medications: [],
            allergies: [],
            lastVisit: null
        };

        console.log('Found user data:', {
            name: persona.name,
            diseases: persona.diseases,
            medications: persona.medications,
            allergies: persona.allergies,
            vitals: persona.vitals,
            diagnosis: persona.diagnosis
        });

        console.log('Full persona object:', JSON.stringify(persona, null, 2));

        // Generate clean user summary - return actual data, let frontend handle empty states
        const userSummary = {
            name: persona.name || user.name,
            age: persona.age,
            phone: user.phone,
            lastVisit: persona.lastVisit,
            diseases: persona.diseases || [],
            medications: persona.medications || [],
            allergies: persona.allergies || [],
            // Include the additional structured data
            vitals: persona.vitals || {},
            labResults: persona.labResults || {},
            diagnosis: persona.diagnosis || {},
            treatmentPlan: persona.treatmentPlan || {},
            visitInfo: persona.visitInfo || {},
            riskAssessment: persona.riskAssessment || {},
            documentSummary: persona.documentSummary || {}
        };

        res.status(200).json(
            new Apiresponse(200, userSummary, 'User data retrieved successfully')
        );
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json(
            new Apiresponse(500, null, 'Failed to fetch user data')
        );
    }
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });

        const usersWithPersona = users.map(user => ({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            persona: user.persona || {
                name: user.name || '',
                age: null,
                diseases: [],
                medications: [],
                allergies: [],
                lastVisit: null
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        res.status(200).json(
            new Apiresponse(200, { users: usersWithPersona, count: usersWithPersona.length }, 'All users retrieved successfully')
        );
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json(
            new Apiresponse(500, null, 'Failed to fetch users data')
        );
    }
});

export { uploadDocument, getUserPersona, getAllUsers };