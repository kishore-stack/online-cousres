import { Router } from "express";
import {
  createModule,
  getModulesByCourse,
  deleteModule,
} from "../controllers/module.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createModule);
router.get("/course/:courseId", getModulesByCourse);
router.delete("/:id", protect, deleteModule);

export default router;