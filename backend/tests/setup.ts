import { prisma } from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany(); // 🔥 ADD THIS
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
});
afterAll(async () => {
  await prisma.$disconnect();
});