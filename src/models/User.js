const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require('../config/roles.js')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: { 
        values: Object.values(ROLES),
        message: `{VALUE} is not a valid role`,
      },
      default: ROLES.VIEWER,
    },
    status: {
      type: String,
      enum: {
        values: ['active','inactive'],
        message: `{VALUE} is not a valid status`,
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
 

userSchema.pre("save", async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
 

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
 
module.exports = mongoose.model('User',userSchema);