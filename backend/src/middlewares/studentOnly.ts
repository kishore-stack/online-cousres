import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const studentOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== "USER") {
    return res.status(403).json({
      message: "Only students can attempt quiz"
    });
  }
  next();
};