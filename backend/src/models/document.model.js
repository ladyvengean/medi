import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    extractedData: {
        diseases: [String],
        medications: [String],
        allergies: [String],
        rawText: String,
        confidence: Number
    },
    errorMessage: String,
    processedAt: Date
}, {
    timestamps: true
});

// Blood Donation Schema
const bloodDonationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    address: {
        type: String,
        required: true
    },
    preferredDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Ambulance Request Schema
const ambulanceRequestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    emergencyType: {
        type: String,
        required: true,
        enum: ['Medical Emergency', 'Accident', 'Heart Attack', 'Breathing Problem', 'Other']
    },
    pickupAddress: {
        type: String,
        required: true
    },
    additionalInfo: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'dispatched', 'arrived', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

const Document = mongoose.model("Document", documentSchema);
const BloodDonation = mongoose.model("BloodDonation", bloodDonationSchema);
const AmbulanceRequest = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);

export default Document;
export { BloodDonation, AmbulanceRequest };