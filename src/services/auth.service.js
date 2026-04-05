const jwt = require('jsonwebtoken');
const User = require('../models/User');

const findUserByEmail = async (email) => {
  return User.findOne({ email }).select('+password');
};

const createUser = async ({ name, email, password, role }) => {
  return User.create({ name, email, password, role });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


const sanitizeUser = (user) => ({
  id:        user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  status:    user.status,
  createdAt: user.createdAt,
});

module.exports = { findUserByEmail, createUser, generateToken, sanitizeUser };