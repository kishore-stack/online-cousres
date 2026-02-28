import request from "supertest";
import { app } from "../src/server";

describe("Server Test", () => {
  it("GET / should return 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});