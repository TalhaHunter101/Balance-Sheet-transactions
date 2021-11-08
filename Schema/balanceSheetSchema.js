const mongoose = require("mongoose");
const BalanceSheet = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    salary: {
      default: false,
      Transaction: [{ Type: String }],
      type: { type: Boolean, default: false },
      balance: {
        type: Number,
        default: 0,
      },
    },
    current: {
      default: false,
      Transaction: [{ Type: String }],
      type: { type: Boolean, default: false },
      balance: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);
const B_sheet = mongoose.model("BalanceSheet", BalanceSheet);
module.exports = B_sheet;
