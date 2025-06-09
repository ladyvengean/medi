import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
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
    processingStatus: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    extractedData: {
        diseases: [String],
        medications: [String],
        labs: [String],
        doctors: [String],
        allergies: [String],
        rawText: String,
        confidence: Number
    },
    errorMessage: String,
    processedAt: Date
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);
export default Document;