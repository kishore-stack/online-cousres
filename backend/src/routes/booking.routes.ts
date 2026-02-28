import { Router } from "express";
import {
  requestBooking,
  approveBooking,
} from "../controllers/booking.controller";
import { protect } from "../middlewares/auth.middleware";
import { bookingLimiter } from "../middlewares/rateLimit.middleware";
import { restrictTo } from "../middlewares/role.middleware";

const router = Router();

/* Student requests booking */
router.post(
  "/",
  protect,
  restrictTo("USER"),
  bookingLimiter,
  requestBooking
);

/* Admin approves booking */
router.patch(
  "/:id/approve",
  protect,
  restrictTo("ADMIN"),
  approveBooking
);

export default router;