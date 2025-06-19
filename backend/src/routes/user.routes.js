// import { Router } from "express";
// import { loginUser, registerUser, getCurrentUser, logoutUser } from "../controllers/user.controller.js"; 
// import { verifyJWT } from "../middlewares/auth.middleware.js"; 
// import { updatePersona } from "../controllers/updatePersona.js";
// import { getPatientPersona } from "../controllers/upload.controller.js";

// const router = Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post('/persona', verifyJWT, updatePersona);
// router.get('/user/persona', verifyJWT, getPatientPersona);

// router.post("/logout", logoutUser);

// export default router;

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
