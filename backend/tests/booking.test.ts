import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/lib/prisma";

describe("Booking Conflict Detection", () => {
  it("should block double booking of same availability", async () => {

    // 1️⃣ Create instructor
    await request(app).post("/auth/register").send({
      name: "Instructor",
      email: "inst@mail.com",
      password: "123456"
    });

    const instructor = await prisma.user.update({
      where: { email: "inst@mail.com" },
      data: { role: "ADMIN" } // change if you use INSTRUCTOR enum
    });

    // 2️⃣ Login instructor
    const instructorLogin = await request(app).post("/auth/login").send({
      email: "inst@mail.com",
      password: "123456"
    });

    const instructorToken = instructorLogin.body.token;

    // 3️⃣ Create availability slot
    const availabilityRes = await request(app)
      .post("/availability")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        startTime: "2026-03-01T10:00:00Z",
        endTime: "2026-03-01T11:00:00Z"
      });

    const availabilityId = availabilityRes.body.id;

    // 4️⃣ Create student
    await request(app).post("/auth/register").send({
      name: "Student",
      email: "student@mail.com",
      password: "123456"
    });

    const studentLogin = await request(app).post("/auth/login").send({
      email: "student@mail.com",
      password: "123456"
    });

    const studentToken = studentLogin.body.token;

    // 5️⃣ First booking request
    const firstBooking = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        availabilityId
      });

    expect(firstBooking.statusCode).toBe(201);

    // 6️⃣ Second booking attempt (same slot)
    const secondBooking = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        availabilityId
      });

    expect(secondBooking.statusCode).toBe(400);
  });
});