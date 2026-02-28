import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

/* ================= GET ALL INSTRUCTORS ================= */
export const getInstructors = asyncHandler(
  async (_req: Request, res: Response) => {

    const instructors = await prisma.user.findMany({
      where: {
        role: "ADMIN" // or change to INSTRUCTOR if you add role later
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(instructors);
  }
);