const FinancialRecord = require("../models/FinancialRecord");

const getSummary = async () => {
  const summaryPipeline = [
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
  ];

  const categoryPipeline = [
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: { type: "$type", category: "$category" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ];

  const recentPipeline = [
    { $match: { deletedAt: null } },
    { $sort: { date: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: "$createdBy" },
  ];

  const [summaryResult, categoryResult, recentRecords] = await Promise.all([
    FinancialRecord.aggregate(summaryPipeline),
    FinancialRecord.aggregate(categoryPipeline),
    FinancialRecord.aggregate(recentPipeline),
  ]);

  const summary = {
    income: 0,
    expense: 0,
    incomeCount: 0,
    expenseCount: 0,
    avgIncome: 0,
    avgExpense: 0,
  };
  summaryResult.forEach(({ _id, total, count, avgAmount }) => {
    if (_id === "income") {
      summary.income = total;
      summary.incomeCount = count;
      summary.avgIncome = Math.round(avgAmount * 100) / 100;
    } else {
      summary.expense = total;
      summary.expenseCount = count;
      summary.avgExpense = Math.round(avgAmount * 100) / 100;
    }
  });
  summary.netBalance = summary.income - summary.expense;

  const categoryBreakdown = {};
  categoryResult.forEach(({ _id, total, count }) => {
    if (!categoryBreakdown[_id.type]) categoryBreakdown[_id.type] = [];
    categoryBreakdown[_id.type].push({
      category: _id.category,
      total: Math.round(total * 100) / 100,
      count,
    });
  });

  return { summary, categoryBreakdown, recentRecords };
};

const getTrends = async ({ period = "monthly", year }) => {
  const matchStage = { deletedAt: null };

  if (year) {
    matchStage.date = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const groupBy =
    period === "weekly"
      ? {
          year: { $year: "$date" },
          week: { $week: "$date" },
        }
      : {
          year: { $year: "$date" },
          month: { $month: "$date" },
        };

  const trendsPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { ...groupBy, type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
  ];

  const results = await FinancialRecord.aggregate(trendsPipeline);

  const periodsMap = {};
  results.forEach(({ _id, total, count }) => {
    const key =
      period === "weekly"
        ? `${_id.year}-W${String(_id.week).padStart(2, "0")}`
        : `${_id.year}-${String(_id.month).padStart(2, "0")}`;

    if (!periodsMap[key]) {
      periodsMap[key] = {
        period: key,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0,
        net: 0,
      };
    }

    if (_id.type === "income") {
      periodsMap[key].income = Math.round(total * 100) / 100;
      periodsMap[key].incomeCount = count;
    } else {
      periodsMap[key].expense = Math.round(total * 100) / 100;
      periodsMap[key].expenseCount = count;
    }

    periodsMap[key].net =
      Math.round((periodsMap[key].income - periodsMap[key].expense) * 100) /
      100;
  });

  return Object.values(periodsMap);
};

module.exports = { getSummary, getTrends };
