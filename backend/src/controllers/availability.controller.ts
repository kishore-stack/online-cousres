import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

/* Instructor adds slot */
export const createAvailability = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      throw new AppError("Start and end time required", 400);
    }

    /* ---------- CONFLICT CHECK ---------- */

    const conflict = await prisma.availability.findFirst({
      where: {
        instructorId: req.userId!,
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });

    if (conflict) {
      throw new AppError("Overlapping slot exists", 400);
    }

    /* ---------- CREATE SLOT ---------- */

    const slot = await prisma.availability.create({
      data: {
        instructorId: req.userId!,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(201).json(slot);
  }
);

/* Get instructor slots */
export const getAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const instructorId = req.params.instructorId as string;

    const slots = await prisma.availability.findMany({
      where: { instructorId },
    });

    res.json(slots);
  }
);