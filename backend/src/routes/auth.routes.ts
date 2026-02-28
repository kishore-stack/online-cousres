import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from "../controllers/auth.controller";

import { protect } from "../middlewares/auth.middleware";
import { loginLimiter, authLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.schema";

const router = Router();

/* Public */
router.post("/register", authLimiter, validate(registerSchema), register);
router.post(
  "/login",
  process.env.NODE_ENV === "production" ? loginLimiter : (req,res,next)=>next(),
  validate(loginSchema),
  login
);
router.post("/refresh", refreshToken);

/* Protected */
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;