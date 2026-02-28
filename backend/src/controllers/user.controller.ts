import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get All Users (without passwords)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getMyCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courses = await prisma.course.findMany({
    where: {
      instructorId: req.userId, // ← your schema supports this
    },
  });

  res.json(courses);
});

/* GET MY ATTEMPTS */
export const getMyAttempts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId: req.userId },
    include: { lesson: true },
  });

  res.json(attempts);
});


export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    const [
      enrolledCourses,
      attempts,
      bookings
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),

      prisma.attempt.findMany({
        where: { userId },
        select: { score: true }
      }),

      prisma.booking.count({
        where: { studentId: userId }
      })
    ]);

    const avgScore =
      attempts.length === 0
        ? 0
        : Math.round(
            attempts.reduce((a, b) => a + b.score, 0) /
              attempts.length
          );

    res.json({
      enrolledCourses,
      attempts: attempts.length,
      avgScore,
      bookings
    });
  }
);

export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const userId = req.userId!;

    const enrolledCourses = await prisma.enrollment.count({
      where: { userId }
    });

    const attempts = await prisma.attempt.findMany({
      where: { userId }
    });

    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.score, 0) /
            attempts.length
          )
        : 0;

    const bookings = await prisma.booking.count({
      where: { studentId: userId }
    });

    res.json({
      enrolledCourses,
      attempts: attempts.length,
      avgScore,
      bookings
    });
  }
);
export const getInstructorsWithCourses = asyncHandler(
  async (_req: Request, res: Response) => {
    const instructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        courses: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json(instructors);
  }
);export const createInstructor = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, email, password, courseId } = req.body;

    if (!name || !email || !password || !courseId)
      throw new AppError("All fields required", 400);

    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists)
      throw new AppError("Email exists", 400);

    const hashed = await bcrypt.hash(password, 10);

    const instructor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "INSTRUCTOR",
        courses: {
          connect: { id: courseId }
        }
      },
      include: {
        courses: true
      }
    });

    res.status(201).json(instructor);
  }
);