const FinancialRecord = require("../models/FinancialRecord");

const getAllRecords = async ({
  page = 1,
  limit = 10,
  type,
  category,
  from,
  to,
}) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = new RegExp(category, "i");

  // date range filter
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const total = await FinancialRecord.find(filter).active().countDocuments();

  const records = await FinancialRecord.find(filter)
    .active()
    .populate("createdBy", "name email")
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    records,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRecordById = async (id) => {
  return FinancialRecord.findOne({ _id: id, deletedAt: null }).populate(
    "createdBy",
    "name email",
  );
};

const createRecord = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

const updateRecord = async (id, updates) => {
  return FinancialRecord.findOneAndUpdate(
    { _id: id, deletedAt: null },
    updates,
    { returnDocument: "after", runValidators: true },
  ).populate("createdBy", "name email");
};

const deleteRecord = async (id) => {
  return FinancialRecord.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { returnDocument: "after" },
  );
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
