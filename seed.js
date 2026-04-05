require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const FinancialRecord = require("./src/models/FinancialRecord");

const users = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Admin1234",
    role: "admin",
  },
  {
    name: "Analyst User",
    email: "analyst@test.com",
    password: "Analyst1234",
    role: "analyst",
  },
  {
    name: "Viewer User",
    email: "viewer@test.com",
    password: "Viewer1234",
    role: "viewer",
  },
];

const categories = {
  income: ["salary", "freelance", "investment", "bonus", "rental"],
  expense: [
    "rent",
    "food",
    "transport",
    "utilities",
    "entertainment",
    "healthcare",
  ],
};

const notes = {
  salary: "Monthly salary payment",
  freelance: "Freelance project payment",
  investment: "Stock dividend received",
  bonus: "Performance bonus",
  rental: "Rental income from property",
  rent: "Monthly rent payment",
  food: "Groceries and dining",
  transport: "Fuel and transport costs",
  utilities: "Electricity and water bill",
  entertainment: "Movies and subscriptions",
  healthcare: "Medical checkup",
};

const randomBetween = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRecords = (adminId) => {
  const records = [];

  for (let month = 0; month < 6; month++) {
    for (let i = 0; i < 2; i++) {
      const category = randomItem(categories.income);
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(Math.floor(randomBetween(1, 28)));

      records.push({
        amount: randomBetween(500, 8000),
        type: "income",
        category,
        date,
        notes: notes[category] || `${category} payment`,
        createdBy: adminId,
      });
    }

    const expenseCount = Math.random() > 0.5 ? 3 : 2;
    for (let i = 0; i < expenseCount; i++) {
      const category = randomItem(categories.expense);
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(Math.floor(randomBetween(1, 28)));

      records.push({
        amount: randomBetween(50, 2000),
        type: "expense",
        category,
        date,
        notes: notes[category] || `${category} payment`,
        createdBy: adminId,
      });
    }
  }

  return records;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log("Existing data cleared");

    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 12),
        })),
      ),
    );
    console.log(`Created ${createdUsers.length} users`);
    const admin = createdUsers.find((u) => u.role === "admin");

    const records = generateRecords(admin._id);
    await FinancialRecord.insertMany(records);
    console.log(`Created ${records.length} financial records`);

    console.log("\n--- Seed complete ---");
    console.log("Login credentials:");
    console.log("  Admin:   admin@test.com   / Admin1234");
    console.log("  Analyst: analyst@test.com / Analyst1234");
    console.log("  Viewer:  viewer@test.com  / Viewer1234");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
