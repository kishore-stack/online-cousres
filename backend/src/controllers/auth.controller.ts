import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { AuthRequest } from "../middlewares/auth.middleware";

/* ================= REGISTER ================= */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input data", 400);
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  res.status(201).json({
    message: "User registered successfully",
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/* ================= LOGIN ================= */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input data", 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new AppError("Invalid credentials", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 400);

  const accessToken = generateAccessToken(user.id, user.role);
 const newRefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
 data: { refreshToken: newRefreshToken },
  });

  res.json({
  message: "Login successful",
  accessToken,
  refreshToken: newRefreshToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
});

/* ================= REFRESH ================= */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  ) as { userId: string };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 403);
  }

  const newAccessToken = generateAccessToken(user.id, user.role);

  res.json({ accessToken: newAccessToken });
});

/* ================= LOGOUT ================= */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.userId! },
    data: { refreshToken: null },
  });

  res.json({ message: "Logged out successfully" });
});

export const getMe = async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};