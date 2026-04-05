const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Access denied. No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, { statusCode: 401, message: 'User no longer exists' });
    }

    if (user.status === 'inactive') {
      return sendError(res, { statusCode: 403, message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { statusCode: 401, message: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, { statusCode: 401, message: 'Invalid token' });
    }
    next(err);
  }
};

module.exports = authenticate;