import { Router } from 'express';
import { uploadDocument, getPatientPersona, getAllPatients } from '../controllers/upload.controller.js';
import upload from '../middlewares/multer.js';

import { verifyJWT } from '../middlewares/auth.middleware.js'; // Disabled for testing

const router = Router();



// Upload document route
router.route('/upload').post(verifyJWT, upload.single('document'), uploadDocument);

// Get patient persona route  
router.route('/patient').get(getPatientPersona);
router.route('/patients').get(getAllPatients);

export default router;