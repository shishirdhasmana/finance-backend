const router = require("express").Router();
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/record.controller");
const {
  createRecordValidator,
  updateRecordValidator,
  recordIdValidator,
  getRecordsValidator,
} = require("../validators/record.validator");
const authenticate = require("../middleware/authenticate");
const { requirePermission } = require("../middleware/authorize");
const validate = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial record management
 */
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List all financial records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: rent
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: 2024-01-01
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: 2024-12-31
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  getRecordsValidator,
  validate,
  requirePermission("records:read"),
  getRecords,
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *       404:
 *         description: Record not found
 */
router.get(
  "/:id",
  recordIdValidator,
  validate,
  requirePermission("records:read"),
  getRecord,
);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record — admin only
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: salary
 *               date:
 *                 type: string
 *                 example: 2024-01-01
 *               notes:
 *                 type: string
 *                 example: January salary payment
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  createRecordValidator,
  validate,
  requirePermission("records:create"),
  createRecord,
);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a financial record — admin only
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       404:
 *         description: Record not found
 */
router.patch(
  "/:id",
  updateRecordValidator,
  validate,
  requirePermission("records:update"),
  updateRecord,
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record — admin only
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 */
router.delete(
  "/:id",
  recordIdValidator,
  validate,
  requirePermission("records:delete"),
  deleteRecord,
);

module.exports = router;
