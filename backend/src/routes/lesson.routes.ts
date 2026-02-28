import { Router } from "express";
import {
  createLesson,
  getLessonsByModule,
  deleteLesson,
} from "../controllers/lesson.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createLesson);
router.get("/module/:moduleId", getLessonsByModule);
router.delete("/:id", protect, deleteLesson);

export default router;