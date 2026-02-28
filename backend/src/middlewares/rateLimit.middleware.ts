import rateLimit from "express-rate-limit";

/* =========================
   LOGIN LIMITER
========================= */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per IP
  message: {
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   GLOBAL API LIMITER
========================= */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    message: "Too many requests. Slow down.",
  },
});

/* -------- AUTH LIMIT -------- */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: "Too many login attempts. Try again later.",
});

/* -------- BOOKING LIMIT -------- */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many booking requests. Slow down.",
});