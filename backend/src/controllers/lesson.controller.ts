import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

/* ================= CREATE LESSON ================= */
export const createLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, content, moduleId } = req.body;

    if (!title || !content || !moduleId) {
      throw new AppError("title, content, moduleId required", 400);
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new AppError("Module not found", 404);
    }

    // ownership check
    if (module.course.instructorId !== req.userId) {
      throw new AppError("Not authorized", 403);
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        moduleId,
      },
    });

    res.status(201).json(lesson);
  }
);

/* ================= GET LESSONS ================= */
export const getLessonsByModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleId = req.params.moduleId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where: { moduleId },
        skip,
        take: limit,
      }),
      prisma.lesson.count({
        where: { moduleId },
      }),
    ]);

    res.json({
      data: lessons,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  }
);
/* ================= DELETE LESSON ================= */
export const deleteLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    if (lesson.module.course.instructorId !== req.userId) {
      throw new AppError("Not authorized", 403);
    }

    await prisma.lesson.delete({
      where: { id },
    });

    res.json({ message: "Lesson deleted successfully" });
  }
);