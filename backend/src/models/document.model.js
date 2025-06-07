import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    // Gemini processing status
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    // Extracted data from this document
    extractedData: {
        diseases: [String],
        medications: [String],
        labs: [String],
        doctors: [String],
        rawText: String, // Full OCR text
        confidence: Number // Gemini confidence score
    },
    processedAt: Date,
    errorMessage: String // If processing fails
}, { timestamps: true });

const Document = mongoose.model("Document", documentSchema);
export default Document;