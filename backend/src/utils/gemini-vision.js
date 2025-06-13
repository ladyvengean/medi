import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileToGenerativePart } from './fileUtils.js'; // Importing the fileToGenerativePart function
dotenv.config();

const API_KEY = process.env.API_KEY_GEMINI;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



const extractMedicalData = async (generativePart) => {
    try {
        const prompt = `
        You are a medical document analyzer.

**Step 1:**
First, determine if the uploaded document is a valid medical document (such as a prescription, lab report, discharge summary, medical history, etc.).

If it is **not** a medical document, return exactly this JSON:
{
  "error": "This is not a valid medical document."
}

**Step 2:**
If it is a medical document, extract the following information and return ONLY a valid JSON object with these exact fields:

{
  "name": "patient full name",
  "age": "patient age as number or null",
  "diseases": ["current diseases/conditions as array"],
  "medications": ["current medications as array"],
  "allergies": ["allergies as array"],
  "lastVisit": "last visit date in YYYY-MM-DD format or null"
}

Rules:
1. If any information is not found, use null for that field
2. For arrays, use empty array [] if no data found
3. Return ONLY a valid JSON object — no explanations or extra text
4. Ensure medication names are properly formatted (brand + generic)`
        const result = await model.generateContent([prompt, generativePart]);
        const responseText = result.response.text();

        //extracting now hehe and cleaning it
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        //parse the json response
        const extractedData = JSON.parse(cleanedResponse);
        //cleaning the data and validating it
        const cleanedData = {
            name: extractedData.name || null,
            age: extractedData.age ? parseInt(extractedData.age) : null,
            diseases: Array.isArray(extractedData.diseases) ? extractedData.diseases.filter(d => d) : [],
            medications: Array.isArray(extractedData.medications) ? extractedData.medications.filter(m => m) : [],
            allergies: Array.isArray(extractedData.allergies) ? extractedData.allergies.filter(a => a) : [],
            lastVisit: extractedData.lastVisit || null
        };

        return cleanedData;
    }
    catch (error) {
        console.error('Error in gemini extraction pal', error);
        return {
            name: null,
            age: null,
            diseases: [],
            medications: [],
            allergies: [],
            lastVisit: null,
            error: `Extraction failed: ${error.message}`
        }

    }
}

export { extractMedicalData };

