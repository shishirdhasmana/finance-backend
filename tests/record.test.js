require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const FinancialRecord = require("../src/models/FinancialRecord");

let adminToken;
let viewerToken;
let recordId;

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/finance_test",
  );

  await request(app).post("/api/auth/register").send({
    name: "Admin Test",
    email: "adminrecord@test.com",
    password: "Admin1234",
    role: "admin",
  });
  await request(app).post("/api/auth/register").send({
    name: "Viewer Test",
    email: "viewerrecord@test.com",
    password: "Viewer1234",
    role: "viewer",
  });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "adminrecord@test.com", password: "Admin1234" });
  const viewerLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "viewerrecord@test.com", password: "Viewer1234" });

  adminToken = adminLogin.body.data.token;
  viewerToken = viewerLogin.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({ email: /test\.com/ });
  await FinancialRecord.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/records", () => {
  it("should allow admin to create a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 1500,
        type: "income",
        category: "salary",
        date: "2024-01-01",
        notes: "Test salary",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(1500);
    recordId = res.body.data._id;
  });

  it("should block viewer from creating a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        amount: 500,
        type: "expense",
        category: "food",
        date: "2024-01-05",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid record data", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: -100,
        type: "transfer",
        category: "",
        date: "bad-date",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("GET /api/records", () => {
  it("should allow viewer to read records", async () => {
    const res = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("total");
  });

  it("should filter records by type", async () => {
    const res = await request(app)
      .get("/api/records?type=income")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((r) => expect(r.type).toBe("income"));
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app).get("/api/records");
    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /api/records/:id", () => {
  it("should soft delete a record", async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app)
      .get(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(check.statusCode).toBe(404);
  });
});
