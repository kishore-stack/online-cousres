import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

   const decoded = jwt.verify(
  token,
  process.env.ACCESS_TOKEN_SECRET!
) as {
  userId: string;
  role: string;
};
    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};