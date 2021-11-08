const mongoose = require("mongoose");
const Transaction = new mongoose.Schema(
  {
    bank_id: {
      type: String,
      required: true,
    },
    Expense: [
      {
        ammount: { type: Number, required: false },
        Date: { type: Date, required: false },
        description: { type: String, required: false },
        category: { type: String, required: false },
      },
    ],

    Income: [
      {
        ammount: { type: Number, required: false },
        Date: { type: Date, required: false },
        description: { type: String, required: false },
        category: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);
const transaction = mongoose.model("transaction", Transaction);
module.exports = transaction;
