import { Router } from "express";
import { createInstructor, createUser, getDashboardStats, getInstructorsWithCourses, getUsers, getUserStats } from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";
import { restrictTo } from "../middlewares/role.middleware";
import { getMyCourses, getMyAttempts } from "../controllers/user.controller";


const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/", protect, getUsers); // 🔐 protected route
router.get("/", protect, restrictTo("ADMIN"), getUsers);
router.get("/my-courses", protect, getMyCourses);
router.get("/my-attempts", protect, getMyAttempts);
router.get("/stats", protect, getDashboardStats);
router.get("/stats", protect, getUserStats);
router.get("/instructors", getInstructorsWithCourses);

router.post(
  "/create-instructor",
  protect,
  restrictTo("ADMIN"),
  createInstructor
);
export default router;