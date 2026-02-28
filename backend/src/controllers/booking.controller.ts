import { Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";
import { logAudit } from "../utils/auditLogger";


/* Student requests booking */
export const requestBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { availabilityId } = req.body;

    const slot = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        instructor: true,
      },
    });

    if (!slot) throw new AppError("Slot not found", 404);

    /* ---------------- CONFLICT CHECK ---------------- */

    const conflict = await prisma.booking.findFirst({
      where: {
        availability: {
          instructorId: slot.instructorId,
          startTime: { lt: slot.endTime },
          endTime: { gt: slot.startTime },
        },
        status: {
          in: ["REQUESTED", "APPROVED"],
        },
      },
    });

    if (conflict) {
      throw new AppError("Instructor already booked in this time range", 400);
    }

    /* ---------------- CREATE BOOKING ---------------- */

    const booking = await prisma.booking.create({
      data: {
        availabilityId,
        studentId: req.userId!,
      },
    });

    res.status(201).json(booking);
  }
);

/* Admin approves booking */
export const approveBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    /* ---------- GET BEFORE STATE ---------- */

    const before = await prisma.booking.findUnique({
      where: { id },
    });

    if (!before) {
      throw new AppError("Booking not found", 404);
    }

    /* ---------- UPDATE BOOKING ---------- */

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    /* ---------- AUDIT LOG ---------- */

    await logAudit({
      userId: req.userId,
      action: "BOOKING_APPROVED",
      entity: "Booking",
      entityId: id,
      before,
      after: booking,
    });

    /* ---------- RESPONSE ---------- */

    res.json(booking);
  }
);