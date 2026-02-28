import { Router } from "express";
import {
  createAvailability,
  getAvailability,
} from "../controllers/availability.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createAvailability);
router.get("/:instructorId", getAvailability);

export default router;