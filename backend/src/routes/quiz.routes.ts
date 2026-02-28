import { Router } from "express";
import {
  createQuestion,
  getLessonQuiz,
  submitQuiz,
} from "../controllers/quiz.controller";
import { protect } from "../middlewares/auth.middleware";
import { studentOnly } from "../middlewares/studentOnly";

const router = Router();

router.post("/", protect, createQuestion);
router.post("/submit", protect, studentOnly, submitQuiz);
router.get("/:lessonId", getLessonQuiz);

export default router;

