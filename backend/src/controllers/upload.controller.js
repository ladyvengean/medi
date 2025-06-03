import { Apierror } from '../utils/Apierror.js';
import { Apiresponse } from '../utils/Apiresponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import run from '../utils/gemini-vision.js';
import compressImage from '../utils/imageCompressor.js';

const getResponse = asyncHandler(async (req, res) => {
	const {imageData } = req.body;
	
	//console.log('Image data', imageData);

	try {
		const compressedBase64Image = await compressImage(imageData);

		const responseFromRun = await run(
			
			compressedBase64Image
		);

		res
			.status(200)
			.json(
				new Apiresponse(
					200,
					{ response: responseFromRun },
					'Response from run function'
				)
			);
	} catch (error) {
		console.error('Error in run function:', error);
		res.status(500).json(new Apierror(500, 'Internal Server Error'));
	}
});

export { getResponse };
