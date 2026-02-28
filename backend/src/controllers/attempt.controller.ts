import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyAttempts = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const attempts = await prisma.attempt.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },

      include: {
        lesson: {
          select: {
            title: true,
            module: {
              select: {
                title: true,
                course: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const formatted = attempts.map(a => ({
      id: a.id,
      score: a.score,
      lesson: a.lesson.title,
      module: a.lesson.module.title,
      course: a.lesson.module.course.title,
      date: a.createdAt
    }));

    res.json(formatted);
  }
);