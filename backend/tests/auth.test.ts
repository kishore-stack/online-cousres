import request from "supertest";
import { app } from "../src/server";

describe("Auth Flow", () => {
  it("registers user", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@mail.com",
      password: "123456",
    });

expect(res.statusCode).toBe(201);
  });

  it("logs in user", async () => {
    await request(app).post("/auth/register").send({
      name: "Login User",
      email: "login@mail.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/login").send({
      email: "login@mail.com",
      password: "123456",
    });

    expect(res.body.token).toBeDefined();
  });
});