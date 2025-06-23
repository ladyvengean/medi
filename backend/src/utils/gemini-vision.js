// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';
// import { fileToGenerativePart } from './fileUtils.js'; // Importing the fileToGenerativePart function
// dotenv.config();

// const API_KEY = process.env.API_KEY_GEMINI;
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



// const extractMedicalData = async (generativePart) => {
//     try {
//         const prompt = `
//         You are a medical document analysis expert. Analyze this medical document and extract ALL relevant patient information in the specified JSON format.

// IMPORTANT INSTRUCTIONS:
// 1. Extract REAL data from the document - do NOT use placeholder or generic responses
// 2. If information is not found, use "Not specified" instead of generic phrases
// 3. Be thorough - look for all medical details, dates, measurements, etc.
// 4. Preserve exact medical terminology and drug names from the document

// Please extract and return a JSON object with this EXACT structure:

// {
//   "patientInfo": {
//     "name": "exact name from document",
//     "age": "age or birth date if found",
//     "gender": "male/female if mentioned",
//     "phone": "phone number if found",
//     "address": "address if found",
//     "emergencyContact": "emergency contact if found"
//   },
//   "medicalHistory": {
//     "currentConditions": ["list actual conditions/diseases mentioned"],
//     "medications": ["list actual medications with dosages if mentioned"],
//     "allergies": ["list actual allergies mentioned"],
//     "pastSurgeries": ["list any surgeries mentioned"],
//     "familyHistory": ["list family medical history if mentioned"]
//   },
//   "vitals": {
//     "bloodPressure": "actual BP reading if found",
//     "heartRate": "actual heart rate if found", 
//     "temperature": "actual temperature if found",
//     "weight": "actual weight if found",
//     "height": "actual height if found",
//     "bmi": "BMI if calculated or mentioned"
//   },
//   "labResults": {
//     "bloodWork": ["any blood test results mentioned"],
//     "urinalysis": ["urine test results if any"],
//     "imaging": ["X-ray, MRI, CT scan results if any"],
//     "otherTests": ["any other test results"]
//   },
//   "diagnosis": {
//     "primaryDiagnosis": "main diagnosis if mentioned",
//     "secondaryDiagnosis": ["other diagnoses if mentioned"],
//     "differentialDiagnosis": ["possible diagnoses being considered"]
//   },
//   "treatmentPlan": {
//     "prescriptions": ["prescribed medications with instructions"],
//     "procedures": ["recommended procedures"],
//     "followUp": "follow-up instructions",
//     "restrictions": ["any activity restrictions"],
//     "recommendations": ["doctor's recommendations"]
//   },
//   "visitInfo": {
//     "visitDate": "date of visit/document",
//     "doctorName": "doctor's name if mentioned",
//     "hospitalClinic": "hospital/clinic name if mentioned",
//     "visitType": "type of visit (consultation, follow-up, emergency, etc.)",
//     "chiefComplaint": "main reason for visit"
//   },
//   "riskAssessment": {
//     "riskLevel": "assess as Low/Medium/High based on findings",
//     "riskFactors": ["specific risk factors identified"],
//     "urgentConcerns": ["any urgent medical concerns"],
//     "score": "numeric risk score 1-10 based on severity"
//   },
//   "documentSummary": {
//     "documentType": "type of document (prescription, lab report, discharge summary, etc.)",
//     "keyFindings": ["most important findings from the document"],
//     "nextSteps": ["immediate next steps recommended"],
//     "followUpRequired": "yes/no and when"
//   }
// }

// CRITICAL: 
// - Extract ACTUAL data from the document
// - Do NOT use generic phrases like "No conditions recorded" 
// - If data is missing, use "Not specified" or "Not mentioned"
// - Include ALL medications, conditions, and medical details found
// - Preserve medical terminology exactly as written
// - Make risk assessment based on actual findings

// Document to analyze:`;
//         const result = await model.generateContent([prompt, generativePart]);
//         const responseText = result.response.text();

//         //extracting now hehe and cleaning it
//         let cleanedResponse = responseText.trim();
//         if (cleanedResponse.startsWith('```json')) {
//             cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
//         } else if (cleanedResponse.startsWith('```')) {
//             cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
//         }
//         //parse the json response
//         const extractedData = JSON.parse(cleanedResponse);
//         //cleaning the data and validating it
//         const cleanedData = {
//             name: extractedData.name || null,
//             age: extractedData.age ? parseInt(extractedData.age) : null,
//             diseases: Array.isArray(extractedData.diseases) ? extractedData.diseases.filter(d => d) : [],
//             medications: Array.isArray(extractedData.medications) ? extractedData.medications.filter(m => m) : [],
//             allergies: Array.isArray(extractedData.allergies) ? extractedData.allergies.filter(a => a) : [],
//             lastVisit: extractedData.lastVisit || null
//         };

//         return cleanedData;
//     }
//     catch (error) {
//         console.error('Error in gemini extraction pal', error);
//         return {
//             name: null,
//             age: null,
//             diseases: [],
//             medications: [],
//             allergies: [],
//             lastVisit: null,
//             error: `Extraction failed: ${error.message}`
//         }

//     }
// }

// export { extractMedicalData };

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
        You are a medical document analysis expert. Analyze this medical document and extract ALL relevant patient information in the specified JSON format.

IMPORTANT INSTRUCTIONS:
1. Extract REAL data from the document - do NOT use placeholder or generic responses
2. If information is not found, use "Not specified" instead of generic phrases
3. Be thorough - look for all medical details, dates, measurements, etc.
4. Preserve exact medical terminology and drug names from the document

Please extract and return a JSON object with this EXACT structure:

{
  "patientInfo": {
    "name": "exact name from document",
    "age": "age or birth date if found",
    "gender": "male/female if mentioned",
    "phone": "phone number if found",
    "address": "address if found",
    "emergencyContact": "emergency contact if found"
  },
  "medicalHistory": {
    "currentConditions": ["list actual conditions/diseases mentioned"],
    "medications": ["list actual medications with dosages if mentioned"],
    "allergies": ["list actual allergies mentioned"],
    "pastSurgeries": ["list any surgeries mentioned"],
    "familyHistory": ["list family medical history if mentioned"]
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

CRITICAL: 
- Extract ACTUAL data from the document
- Do NOT use generic phrases like "No conditions recorded" 
- If data is missing, use "Not specified" or "Not mentioned"
- Include ALL medications, conditions, and medical details found
- Preserve medical terminology exactly as written
- Make risk assessment based on actual findings

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

        // FIXED: Return the complete extracted data structure instead of just basic fields
        const processedData = {
            // Basic patient info
            name: extractedData.patientInfo?.name || "Not specified",
            age: extractedData.patientInfo?.age || "Not specified",
            gender: extractedData.patientInfo?.gender || "Not specified",
            phone: extractedData.patientInfo?.phone || "Not specified",
            address: extractedData.patientInfo?.address || "Not specified",
            emergencyContact: extractedData.patientInfo?.emergencyContact || "Not specified",

            // Medical history
            currentConditions: extractedData.medicalHistory?.currentConditions || [],
            medications: extractedData.medicalHistory?.medications || [],
            allergies: extractedData.medicalHistory?.allergies || [],
            pastSurgeries: extractedData.medicalHistory?.pastSurgeries || [],
            familyHistory: extractedData.medicalHistory?.familyHistory || [],

            // Vitals
            vitals: {
                bloodPressure: extractedData.vitals?.bloodPressure || "Not specified",
                heartRate: extractedData.vitals?.heartRate || "Not specified",
                temperature: extractedData.vitals?.temperature || "Not specified",
                weight: extractedData.vitals?.weight || "Not specified",
                height: extractedData.vitals?.height || "Not specified",
                bmi: extractedData.vitals?.bmi || "Not specified"
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
                primaryDiagnosis: extractedData.diagnosis?.primaryDiagnosis || "Not specified",
                secondaryDiagnosis: extractedData.diagnosis?.secondaryDiagnosis || [],
                differentialDiagnosis: extractedData.diagnosis?.differentialDiagnosis || []
            },

            // Treatment plan
            treatmentPlan: {
                prescriptions: extractedData.treatmentPlan?.prescriptions || [],
                procedures: extractedData.treatmentPlan?.procedures || [],
                followUp: extractedData.treatmentPlan?.followUp || "Not specified",
                restrictions: extractedData.treatmentPlan?.restrictions || [],
                recommendations: extractedData.treatmentPlan?.recommendations || []
            },

            // Visit info
            visitInfo: {
                visitDate: extractedData.visitInfo?.visitDate || "Not specified",
                doctorName: extractedData.visitInfo?.doctorName || "Not specified",
                hospitalClinic: extractedData.visitInfo?.hospitalClinic || "Not specified",
                visitType: extractedData.visitInfo?.visitType || "Not specified",
                chiefComplaint: extractedData.visitInfo?.chiefComplaint || "Not specified"
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
            name: "Not specified",
            age: "Not specified",
            currentConditions: [],
            medications: [],
            allergies: [],
            lastVisit: "Not specified",
            error: `Extraction failed: ${error.message}`
        };
    }
};

export { extractMedicalData };