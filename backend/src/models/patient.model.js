import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to your existing User model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    // Extracted persona data (populated after Gemini processing)
    persona: {
        diseases: {
            current: [String],
            past: [String]
        },
        medications: [String],
        labs: [String],
        doctors: [String],
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    // ML risk prediction
    riskPrediction: {
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        factors: [String],
        lastUpdated: Date
    },
    docs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document"
    }]
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema); 
export default Patient;