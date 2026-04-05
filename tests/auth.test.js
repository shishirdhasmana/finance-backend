require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/finance_test",
  );
});

afterAll(async () => {
  await User.deleteMany({ email: /test\.com/ });
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@test.com",
      password: "Test1234",
      role: "viewer",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("testuser@test.com");
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@test.com",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid input", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "notanemail",
      password: "weak",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@test.com",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@test.com",
      password: "WrongPass1",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
