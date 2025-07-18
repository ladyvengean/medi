import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
        },
        refreshToken: {
            type: String
        },
        persona: {
            name: { type: String },
            age: { type: Number },
            diseases: { type: [String], default: [] },
            medications: { type: [String], default: [] },
            allergies: { type: [String], default: [] },
            lastVisit: { type: String },
            // Additional structured medical data from Gemini
            vitals: {
                bloodPressure: { type: String },
                heartRate: { type: String },
                temperature: { type: String },
                weight: { type: String },
                height: { type: String },
                bmi: { type: String }
            },
            labResults: {
                bloodWork: { type: [String], default: [] },
                urinalysis: { type: [String], default: [] },
                imaging: { type: [String], default: [] },
                otherTests: { type: [String], default: [] }
            },
            diagnosis: {
                primaryDiagnosis: { type: String },
                secondaryDiagnosis: { type: [String], default: [] },
                differentialDiagnosis: { type: [String], default: [] }
            },
            treatmentPlan: {
                prescriptions: { type: [String], default: [] },
                procedures: { type: [String], default: [] },
                followUp: { type: String },
                restrictions: { type: [String], default: [] },
                recommendations: { type: [String], default: [] }
            },
            visitInfo: {
                visitDate: { type: String },
                doctorName: { type: String },
                hospitalClinic: { type: String },
                visitType: { type: String },
                chiefComplaint: { type: String }
            },
            riskAssessment: {
                riskLevel: { type: String },
                riskFactors: { type: [String], default: [] },
                urgentConcerns: { type: [String], default: [] },
                score: { type: Number }
            },
            documentSummary: {
                documentType: { type: String },
                keyFindings: { type: [String], default: [] },
                nextSteps: { type: [String], default: [] },
                followUpRequired: { type: String }
            }
        }
    },
    {
        timestamps: true
    }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if the entered password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone, // Changed from email to phone
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
