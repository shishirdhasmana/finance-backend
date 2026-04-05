const { getSummary, getTrends } = require("../services/dashboard.service");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getDashboardSummary = async (req, res, next) => {
  try {
    const { summary, categoryBreakdown, recentRecords } = await getSummary();

    return sendSuccess(res, {
      message: "Dashboard summary retrieved successfully",
      data: {
        summary,
        categoryBreakdown,
        recentRecords,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardTrends = async (req, res, next) => {
  try {
    const { period, year } = req.query;

    if (period && !["monthly", "weekly"].includes(period)) {
      return sendError(res, {
        statusCode: 400,
        message: "Period must be monthly or weekly",
      });
    }

    if (year && (isNaN(year) || year < 2000 || year > 2100)) {
      return sendError(res, {
        statusCode: 400,
        message: "Year must be a valid year between 2000 and 2100",
      });
    }

    const trends = await getTrends({ period, year });

    return sendSuccess(res, {
      message: "Trends retrieved successfully",
      data: { period: period || "monthly", trends },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, getDashboardTrends };
