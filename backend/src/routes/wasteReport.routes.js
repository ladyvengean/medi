import { Router } from "express";
import { createWasteReport, classifyWaste } from "../controllers/wasteReport.controller.js";

const router = Router();

router.post("/report", createWasteReport);
router.post("/classify", classifyWaste);

export default router;







