import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth.middleware";

/* ================= CREATE QUESTION ================= */
export const createQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { question, options, answer, lessonId } = req.body;

    if (!question || !options || !answer || !lessonId) {
      throw new AppError("Missing fields", 400);
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) throw new AppError("Lesson not found", 404);

    if (lesson.module.course.instructorId !== req.userId) {
      throw new AppError("Not authorized", 403);
    }

    const quiz = await prisma.quiz.create({
      data: { question, options, answer, lessonId },
    });

    res.status(201).json(quiz);
  }
);

/* ================= GET QUESTIONS ================= */
export const getLessonQuiz = asyncHandler(
  async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId as string;

    const questions = await prisma.quiz.findMany({
      where: { lessonId },
      select: {
        id: true,
        question: true,
        options: true,
      },
    });

    res.json(questions);
  }
);

/* ================= SUBMIT QUIZ ================= */
export const submitQuiz = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { lessonId, answers } = req.body;

    if (!lessonId || !answers) {
      throw new AppError("Missing lessonId or answers", 400);
    }

    /* ---------- PREVENT RETAKE ---------- */
    const existing = await prisma.attempt.findUnique({
      where: {
        userId_lessonId: {
          userId: req.userId!,
          lessonId,
        },
      },
    });

    if (existing) {
      throw new AppError("You already attempted this quiz", 400);
    }

    /* ---------- GET QUESTIONS ---------- */
    const questions = await prisma.quiz.findMany({
      where: { lessonId },
    });

    if (!questions.length) {
      throw new AppError("Quiz not found", 404);
    }

    /* ---------- SCORE CALCULATION ---------- */
    let score = 0;
    const incorrect: any[] = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];

      if (userAnswer === q.answer) {
        score++;
      } else {
        incorrect.push({
          question: q.question,
          correct: q.answer,
          yours: userAnswer,
        });
      }
    });

    /* ---------- SAVE ATTEMPT ---------- */
    await prisma.attempt.create({
      data: {
        userId: req.userId!,
        lessonId,
        score,
        answers,
      },
    });

    /* ---------- FETCH EXTRA INFO ---------- */
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { name: true },
    });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true },
    });

    /* ---------- RESPONSE ---------- */
    res.json({
      score,
      total: questions.length,
      incorrect,
      profile: user?.name,
      lesson: lesson?.title,
    });
  }
);