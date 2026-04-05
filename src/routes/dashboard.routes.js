const router = require("express").Router();
const {
  getDashboardSummary,
  getDashboardTrends,
} = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/authenticate");
const { requirePermission } = require("../middleware/authorize");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary endpoints
 */
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary — totals, category breakdown, recent records
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         income:       { type: number, example: 5800   }
 *                         expense:      { type: number, example: 1550   }
 *                         netBalance:   { type: number, example: 4250   }
 *                         incomeCount:  { type: integer, example: 2     }
 *                         expenseCount: { type: integer, example: 3     }
 *                         avgIncome:    { type: number, example: 2900   }
 *                         avgExpense:   { type: number, example: 516.67 }
 *                     categoryBreakdown:
 *                       type: object
 *                     recentRecords:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FinancialRecord'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/summary",
  requirePermission("dashboard:read"),
  getDashboardSummary,
);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get income vs expense trends — analyst and admin only
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           example: monthly
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *       400:
 *         description: Invalid period or year
 *       403:
 *         description: Analyst or admin access required
 */
router.get(
  "/trends",
  requirePermission("dashboard:trends"),
  getDashboardTrends,
);

module.exports = router;
