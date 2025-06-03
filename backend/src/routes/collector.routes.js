import { Router } from "express";
import { getAvailableCollectors, assignCollector, updateCollectorStatus } from "../controllers/collector.controller.js";

const router = Router();

router.get("/available", getAvailableCollectors);
router.post("/assign", assignCollector);
router.patch("/update-status", updateCollectorStatus);

export default router;
