import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import morgan from "morgan";
import { logger } from "./utils/logger";
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import courseRoutes from "./routes/course.routes";
import moduleRoutes from "./routes/module.routes";
import lessonRoutes from "./routes/lesson.routes";
import quizRoutes from "./routes/quiz.routes";
import availabilityRoutes from "./routes/availability.routes";
import bookingRoutes from "./routes/booking.routes";
import helmet from "helmet";
import attemptRoutes from "./routes/attempt.routes";
import instructorRoutes from "./routes/instructor.routes";




export const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/attempts", attemptRoutes);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/quiz", quizRoutes);
app.use("/availability", availabilityRoutes);
app.use("/booking", bookingRoutes);
app.use("/instructors", instructorRoutes);
app.use(helmet());
app.use(errorHandler);
app.get("/", (_req, res) => {
  res.json({ message: "API Running" });
});
// app.get("/modules-test", (req,res)=>res.send("modules working"));
const PORT = 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}