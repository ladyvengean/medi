import { Router } from "express";
import { 
    loginUser, 
    registerUser, 
    getCurrentUser, 
    logoutUser,
    createBloodDonationRequest,
    createAmbulanceRequest,
    getUserBloodDonations,
    getUserAmbulanceRequests
} from "../controllers/user.controller.js"; 
import { getUserPersona } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// User routes
router.get("/current", verifyJWT, getCurrentUser);
router.get("/:id", getUserPersona); // Public for testing

// Blood donation routes
router.post("/blood-donation", createBloodDonationRequest); // Public route for non-authenticated users
router.get("/blood-donations", verifyJWT, getUserBloodDonations); // Authenticated route

// Ambulance request routes
router.post("/ambulance-request", createAmbulanceRequest); // Public route for emergencies
router.get("/ambulance-requests", verifyJWT, getUserAmbulanceRequests); // Authenticated route

export default router;
