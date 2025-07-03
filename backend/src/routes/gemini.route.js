import { Router } from 'express';
import { uploadDocument, getUserPersona, getAllUsers } from '../controllers/upload.controller.js';
import upload from '../middlewares/multer.js';

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Upload document route (requires authentication for user context)
router.route('/upload').post(verifyJWT, upload.single('document'), uploadDocument);

// Get user persona route (public for testing)
router.route('/user/:id').get(getUserPersona);
router.route('/users').get(getAllUsers);

export default router;