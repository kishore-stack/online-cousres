import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Prisma } from "@prisma/client";

/* ================= CREATE MODULE ================= */
export const createModule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, courseId } = req.body;

    if (!title || !courseId) {
      throw new AppError("Title and courseId required", 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    // only course owner can add modules
    if (course.instructorId !== req.userId) {
      throw new AppError("Not authorized", 403);
    }

    const module = await prisma.module.create({
      data: {
        title,
        courseId,
      },
    });

    res.status(201).json(module);
  }
);

/* ================= GET MODULES BY COURSE ================= */
export const getModulesByCourse = asyncHandler(
  async (req: Request, res: Response) => {
    /* ---------- PARAMS ---------- */

    const courseId = req.params.courseId as string;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * limit;

    /* ---------- WHERE FILTER ---------- */

    const where: Prisma.ModuleWhereInput = {
      courseId,
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    /* ---------- QUERY ---------- */

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip,
        take: limit,
     
      }),

      prisma.module.count({ where }),
    ]);

    /* ---------- RESPONSE ---------- */

    res.json({
      data: modules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

export const deleteModule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!module) {
      throw new AppError("Module not found", 404);
    }

    if (module.course.instructorId !== req.userId) {
      throw new AppError("Not authorized", 403);
    }

    await prisma.module.delete({
      where: { id },
    });

    res.json({ message: "Module deleted successfully" });
  }
);