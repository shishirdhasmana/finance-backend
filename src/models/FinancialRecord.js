const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount should be greater than 0"],
    },
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid type. Use income or expense",
      },
      required: [true, "Type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxLength: [50, "Category cannot exceed 50 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

financialRecordSchema.index({ type: 1, category: 1, date: -1 });
financialRecordSchema.index({ deletedAt: 1 });

financialRecordSchema.query.active = function () {
  return this.where({ deletedAt: null });
};

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);
