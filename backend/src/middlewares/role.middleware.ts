import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};