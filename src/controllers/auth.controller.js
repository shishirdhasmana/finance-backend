const {
  findUserByEmail,
  createUser,
  generateToken,
  sanitizeUser,
} = require("../services/auth.service.js");
const { sendSuccess, sendError } = require("../utils/apiResponse.js");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return sendError(res, {
        statusCode: 409,
        message: "An account with this email already exists",
      });
    }

    const user = await createUser({ name, email, password, role });
    const token = generateToken(user);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Account created successfully",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, {
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    if (user.status === "inactive") {
      return sendError(res, {
        statusCode: 403,
        message: "Your account has been deactivated. Please contact an admin",
      });
    }

    const token = generateToken(user);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Login successful",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
