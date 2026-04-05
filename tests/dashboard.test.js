require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const FinancialRecord = require("../src/models/FinancialRecord");
jest.setTimeout(30000);

let adminToken;
let viewerToken;
let analystToken;

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/finance_test",
  );

  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin",
      email: "admindash@test.com",
      password: "Admin1234",
      role: "admin",
    });
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Analyst",
      email: "analystdash@test.com",
      password: "Analyst1234",
      role: "analyst",
    });
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Viewer",
      email: "viewerdash@test.com",
      password: "Viewer1234",
      role: "viewer",
    });

  const [a, an, v] = await Promise.all([
    request(app)
      .post("/api/auth/login")
      .send({ email: "admindash@test.com", password: "Admin1234" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "analystdash@test.com", password: "Analyst1234" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "viewerdash@test.com", password: "Viewer1234" }),
  ]);

  adminToken = a.body.data.token;
  analystToken = an.body.data.token;
  viewerToken = v.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({ email: /test\.com/ });
  await FinancialRecord.deleteMany({});
  await mongoose.connection.close();
});

describe("GET /api/dashboard/summary", () => {
  it("should return summary for admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary).toHaveProperty("income");
    expect(res.body.data.summary).toHaveProperty("expense");
    expect(res.body.data.summary).toHaveProperty("netBalance");
    expect(res.body.data).toHaveProperty("categoryBreakdown");
    expect(res.body.data).toHaveProperty("recentRecords");
  });

  it("should return summary for viewer", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should block unauthenticated request", async () => {
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/dashboard/trends", () => {
  it("should return monthly trends for admin", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends?period=monthly")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.period).toBe("monthly");
    expect(Array.isArray(res.body.data.trends)).toBe(true);
  });

  it("should return weekly trends", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends?period=weekly")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.period).toBe("weekly");
  });

  it("should allow analyst to access trends", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should block viewer from trends", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should reject invalid period", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends?period=yearly")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });
});
