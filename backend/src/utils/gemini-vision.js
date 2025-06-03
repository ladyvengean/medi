import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileToGenerativePart } from './fileUtils.js'; // Importing the fileToGenerativePart function
dotenv.config();

const API_KEY = process.env.API_KEY_GEMINI;
const genAI = new GoogleGenerativeAI(API_KEY);
async function run(imageData) {
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

	const prompt = `suggest me what type of waste is it, electric_waste, recyclable_waste, non-recyclable_waste, only give from these 3 options plss`;

	try {
		const generativePart = await fileToGenerativePart(imageData, 'image/jpeg');
		const result = await model.generateContent([prompt, generativePart]);

		const response = result.response;
		const text = response.text();

		console.log('hello',text);
		return text;
	} catch (error) {
		console.error('Error in run function:', error);
		throw error; // Re-throw the error to be caught by the calling function
		
	}
}

export default run;