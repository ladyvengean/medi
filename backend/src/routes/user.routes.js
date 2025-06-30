

import { Router } from "express";
import { loginUser, registerUser, getCurrentUser, logoutUser } from "../controllers/user.controller.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js"; 


const router = Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// User routes
router.get("/current", verifyJWT, getCurrentUser);


export default router;
