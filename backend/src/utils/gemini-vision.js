

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileToGenerativePart } from './fileUtils.js';
dotenv.config();

const API_KEY = process.env.API_KEY_GEMINI;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const extractMedicalData = async (generativePart) => {
    try {
        const prompt = `
        You are an expert medical AI assistant analyzing medical documents. Your job is to extract information AND provide intelligent medical insights based on the findings.

CRITICAL INSTRUCTIONS:
1. Extract ALL real data from the document - be thorough and detailed
2. NEVER return "Not specified" - instead provide medical context and suggestions
3. When explicit information is missing, provide educated medical insights based on what IS present
4. For medications: suggest typical treatments for diagnosed conditions if not explicitly listed
5. For allergies: if none mentioned, suggest common allergies to monitor for given the patient's conditions
6. For conditions: include related health risks and complications based on findings
7. Be proactive in providing medical advice and monitoring recommendations

Please extract and return a JSON object with this EXACT structure:

{
  "userInfo": {
    "name": "exact name from document",
    "age": "age or birth date if found",
    "gender": "male/female if mentioned",
    "phone": "phone number if found",
    "address": "address if found",
    "emergencyContact": "emergency contact if found"
  },
  "medicalHistory": {
    "currentConditions": ["list actual conditions/diseases mentioned + related complications and risks"],
    "medications": ["list actual medications OR suggest appropriate treatments for diagnosed conditions"],
    "allergies": ["list actual allergies OR suggest common allergies to monitor based on conditions/medications"],
    "pastSurgeries": ["list any surgeries mentioned OR suggest procedures that may be needed"],
    "familyHistory": ["list family medical history if mentioned OR note genetic risk factors"]
  },
  "vitals": {
    "bloodPressure": "actual BP reading if found",
    "heartRate": "actual heart rate if found", 
    "temperature": "actual temperature if found",
    "weight": "actual weight if found",
    "height": "actual height if found",
    "bmi": "BMI if calculated or mentioned"
  },
  "labResults": {
    "bloodWork": ["any blood test results mentioned"],
    "urinalysis": ["urine test results if any"],
    "imaging": ["X-ray, MRI, CT scan results if any"],
    "otherTests": ["any other test results"]
  },
  "diagnosis": {
    "primaryDiagnosis": "main diagnosis if mentioned",
    "secondaryDiagnosis": ["other diagnoses if mentioned"],
    "differentialDiagnosis": ["possible diagnoses being considered"]
  },
  "treatmentPlan": {
    "prescriptions": ["prescribed medications with instructions"],
    "procedures": ["recommended procedures"],
    "followUp": "follow-up instructions",
    "restrictions": ["any activity restrictions"],
    "recommendations": ["doctor's recommendations"]
  },
  "visitInfo": {
    "visitDate": "date of visit/document",
    "doctorName": "doctor's name if mentioned",
    "hospitalClinic": "hospital/clinic name if mentioned",
    "visitType": "type of visit (consultation, follow-up, emergency, etc.)",
    "chiefComplaint": "main reason for visit"
  },
  "riskAssessment": {
    "riskLevel": "assess as Low/Medium/High based on findings",
    "riskFactors": ["specific risk factors identified"],
    "urgentConcerns": ["any urgent medical concerns"],
    "score": "numeric risk score 1-10 based on severity"
  },
  "documentSummary": {
    "documentType": "type of document (prescription, lab report, discharge summary, etc.)",
    "keyFindings": ["most important findings from the document"],
    "nextSteps": ["immediate next steps recommended"],
    "followUpRequired": "yes/no and when"
  }
}

CRITICAL MEDICAL AI INSTRUCTIONS: 
- Extract ALL actual data from the document with medical context
- NEVER use "Not specified" - provide medical insights instead
- For missing medications: suggest evidence-based treatments for diagnosed conditions
- For missing allergies: list common drug/food allergies to monitor given the patient's profile
- For incomplete conditions: infer related health risks from lab values/symptoms
- Include preventive care recommendations and monitoring suggestions
- Provide actionable medical insights, not just data extraction
- Risk assessment should include specific recommendations for patient safety

Document to analyze:`;

        const result = await model.generateContent([prompt, generativePart]);
        const responseText = result.response.text();

        // Clean the response
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        // Parse the JSON response
        const extractedData = JSON.parse(cleanedResponse);

        // Return the complete extracted data structure
        const processedData = {
            // Basic user info
            name: extractedData.userInfo?.name || "Patient Name Pending",
            age: extractedData.userInfo?.age || "Age Pending Verification",
            gender: extractedData.userInfo?.gender || "Gender Pending Verification",
            phone: extractedData.userInfo?.phone || "Contact Info Pending",
            address: extractedData.userInfo?.address || "Address Pending Verification",
            emergencyContact: extractedData.userInfo?.emergencyContact || "Emergency Contact Pending",

            // Medical history
            currentConditions: extractedData.medicalHistory?.currentConditions || [],
            medications: extractedData.medicalHistory?.medications || [],
            allergies: extractedData.medicalHistory?.allergies || [],
            pastSurgeries: extractedData.medicalHistory?.pastSurgeries || [],
            familyHistory: extractedData.medicalHistory?.familyHistory || [],

            // Vitals
            vitals: {
                bloodPressure: extractedData.vitals?.bloodPressure || "Monitor BP regularly",
                heartRate: extractedData.vitals?.heartRate || "Check pulse during visits",
                temperature: extractedData.vitals?.temperature || "Normal temp monitoring",
                weight: extractedData.vitals?.weight || "Weight monitoring recommended",
                height: extractedData.vitals?.height || "Height measurement needed",
                bmi: extractedData.vitals?.bmi || "BMI calculation pending"
            },

            // Lab results
            labResults: {
                bloodWork: extractedData.labResults?.bloodWork || [],
                urinalysis: extractedData.labResults?.urinalysis || [],
                imaging: extractedData.labResults?.imaging || [],
                otherTests: extractedData.labResults?.otherTests || []
            },

            // Diagnosis
            diagnosis: {
                primaryDiagnosis: extractedData.diagnosis?.primaryDiagnosis || "Comprehensive evaluation needed",
                secondaryDiagnosis: extractedData.diagnosis?.secondaryDiagnosis || [],
                differentialDiagnosis: extractedData.diagnosis?.differentialDiagnosis || []
            },

            // Treatment plan
            treatmentPlan: {
                prescriptions: extractedData.treatmentPlan?.prescriptions || [],
                procedures: extractedData.treatmentPlan?.procedures || [],
                followUp: extractedData.treatmentPlan?.followUp || "Regular follow-up recommended",
                restrictions: extractedData.treatmentPlan?.restrictions || [],
                recommendations: extractedData.treatmentPlan?.recommendations || []
            },

            // Visit info
            visitInfo: {
                visitDate: extractedData.visitInfo?.visitDate || "Previous visit date pending",
                doctorName: extractedData.visitInfo?.doctorName || "Healthcare provider pending",
                hospitalClinic: extractedData.visitInfo?.hospitalClinic || "Healthcare facility pending",
                visitType: extractedData.visitInfo?.visitType || "Visit type pending verification",
                chiefComplaint: extractedData.visitInfo?.chiefComplaint || "Chief complaint pending documentation"
            },

            // Risk assessment
            riskAssessment: {
                riskLevel: extractedData.riskAssessment?.riskLevel || "Low",
                riskFactors: extractedData.riskAssessment?.riskFactors || [],
                urgentConcerns: extractedData.riskAssessment?.urgentConcerns || [],
                score: extractedData.riskAssessment?.score || 1
            },

            // Document summary
            documentSummary: {
                documentType: extractedData.documentSummary?.documentType || "Not specified",
                keyFindings: extractedData.documentSummary?.keyFindings || [],
                nextSteps: extractedData.documentSummary?.nextSteps || [],
                followUpRequired: extractedData.documentSummary?.followUpRequired || "Not specified"
            },

            // Keep the last visit for backward compatibility
            lastVisit: extractedData.visitInfo?.visitDate || "Not specified"
        };

        return processedData;

    } catch (error) {
        console.error('Error in gemini extraction:', error);
        return {
            name: "Patient Name Pending",
            age: "Age Verification Needed",
            currentConditions: ["General health monitoring recommended"],
            medications: ["Medication review needed"],
            allergies: ["Allergy screening recommended"],
            lastVisit: "Previous visit date pending",
            error: `Extraction failed: ${error.message}`
        };
    }
};

export { extractMedicalData };