import { Router } from "express";
import { getInstructors } from "../controllers/instructor.controller";

const router = Router();

router.get("/", getInstructors);

export default router;