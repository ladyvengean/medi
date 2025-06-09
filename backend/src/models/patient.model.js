import mongoose, { Schema } from 'mongoose';

const patientSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        default: null
    },
    contact: {
        type: String,
        default: ''
    },
    persona: {
        diseases: {
            current: [String],
            past: [String]
        },
        medications: [String],
        labs: [String],
        doctors: [String],
        allergies: [String],
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    riskPrediction: {
        score: {
            type: Number,
            default: 0
        },
        factors: [String],
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    docs: [{
        type: Schema.Types.ObjectId,
        ref: 'Document'
    }]
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;