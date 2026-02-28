import { Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request} from "express";
import { Prisma } from "@prisma/client";
import { logAudit } from "../utils/auditLogger";
import { cache } from "../utils/cache";


/* ================= CREATE COURSE ================= */
export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.role !== "ADMIN") {
    throw new AppError("Only instructors can create courses", 403);
  }

  const { title, description } = req.body;

  if (!title || !description) {
    throw new AppError("Title and description required", 400);
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      instructorId: req.userId!,
    },
  });
await logAudit({
  userId: req.userId,
  action: "CREATE_COURSE",
  entity: "Course",
  entityId: course.id,
  after: course,
});
  res.status(201).json(course);
});


/* ================= GET ALL COURSES ================= */
export const getCourses = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const courses = await prisma.course.findMany({
      include: {
        enrollments: {
          where: { userId: req.userId },
          select: { id: true }
        }
      }
    });

    const formatted = courses.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      enrolled: c.enrollments.length > 0
    }));

    res.json(formatted);
  }
);


/* ================= GET SINGLE COURSE ================= */
export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  res.json(course);
});


/* ================= DELETE COURSE ================= */
export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.instructorId !== req.userId) {
    throw new AppError("Not authorized", 403);
  }

  await prisma.course.delete({
    where: { id },
  });

  res.json({ message: "Course deleted successfully" });
});

export const enrollCourse = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const courseId = req.params.id as string;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID missing" });
    }

    await prisma.enrollment.create({
      data: {
        userId: req.userId!,
        courseId
      }
    });

    res.json({ message: "Enrolled successfully" });
  }
);