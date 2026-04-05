const User = require("../models/User");

const getAllUsers = async ({ page = 1, limit = 10, role, status }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    users,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (id) => {
  return User.findById(id);
};

const createUser = async ({ name, email, password, role, status }) => {
  return User.create({ name, email, password, role, status });
};

const updateUser = async (id, updates) => {
  return User.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    runValidators: true,
  });
};

const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
