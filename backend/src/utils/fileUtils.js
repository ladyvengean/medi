// async function fileToGenerativePart(buffer, mimeType) {
// 	const base64String = buffer.toString('base64');
// 	const generativePart = {
// 		inlineData: {
// 			data: base64String,
// 			mimeType: mimeType
// 		}
// 	};

// 	return generativePart;
// }

// export { fileToGenerativePart };

// Convert file buffer to generative part for Gemini
export const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeType
        }
    };
};