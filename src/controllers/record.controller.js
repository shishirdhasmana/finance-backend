const recordService = require("../services/record.service");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getRecords = async (req, res, next) => {
  try {
    const { page, limit, type, category, from, to } = req.query;
    const { records, meta } = await recordService.getAllRecords({
      page,
      limit,
      type,
      category,
      from,
      to,
    });

    return sendSuccess(res, {
      message: "Records retrieved successfully",
      data: records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

const getRecord = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    if (!record) {
      return sendError(res, { statusCode: 404, message: "Record not found" });
    }
    return sendSuccess(res, {
      message: "Record retrieved successfully",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Record created successfully",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    if (!record) {
      return sendError(res, { statusCode: 404, message: "Record not found" });
    }
    return sendSuccess(res, {
      message: "Record updated successfully",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await recordService.deleteRecord(req.params.id);
    if (!record) {
      return sendError(res, {
        statusCode: 404,
        message: "Record not found or already deleted",
      });
    }
    return sendSuccess(res, { message: "Record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
