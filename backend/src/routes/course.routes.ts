import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  deleteCourse,
  enrollCourse,
} from "../controllers/course.controller";
import { protect } from "../middlewares/auth.middleware";
import { restrictTo } from "../middlewares/role.middleware";


const router = Router();

router.post("/", protect, restrictTo("ADMIN"), createCourse);
router.get("/", getCourses);
router.post("/enroll/:id", protect, enrollCourse);
router.get("/:id", getCourse);
router.delete("/:id", protect, restrictTo("ADMIN"), deleteCourse);


export default router;