const userService = require("../services/user.service");
const { findUserByEmail, sanitizeUser } = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, role, status } = req.query;
    const { users, meta } = await userService.getAllUsers({
      page,
      limit,
      role,
      status,
    });

    return sendSuccess(res, {
      message: "Users retrieved successfully",
      data: users.map(sanitizeUser),
      meta,
    });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: "User not found" });
    }
    return sendSuccess(res, {
      message: "User retrieved successfully",
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return sendError(res, {
        statusCode: 409,
        message: "An account with this email already exists",
      });
    }

    const user = await userService.createUser({
      name,
      email,
      password,
      role,
      status,
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: "User created successfully",
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    // prevent admin from deactivating their own account
    if (
      req.params.id === req.user._id.toString() &&
      req.body.status === "inactive"
    ) {
      return sendError(res, {
        statusCode: 400,
        message: "You cannot deactivate your own account",
      });
    }

    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return sendError(res, { statusCode: 404, message: "User not found" });
    }
    return sendSuccess(res, {
      message: "User updated successfully",
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, {
        statusCode: 400,
        message: "You cannot delete your own account",
      });
    }

    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: "User not found" });
    }
    return sendSuccess(res, { message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
