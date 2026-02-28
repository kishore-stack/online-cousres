import { Router } from "express";
import { getMyAttempts } from "../controllers/attempt.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/my", protect, getMyAttempts);

export default router;