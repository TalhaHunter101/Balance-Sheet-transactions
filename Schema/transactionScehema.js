const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Transaction = new mongoose.Schema(
  {
    bank_id: {
      type: Schema.Types.ObjectId,
      ref: "bAccount",
    },
    T_Type: { type: String, enum: ["expense", "income"], required: true },
    ammount: { type: Number, required: false },
    Date: { type: String, required: false },
    description: { type: String, required: false },
    category: { type: String, required: false },
  },
  { timestamps: true }
);
const transaction = mongoose.model("transaction", Transaction);
module.exports = transaction;
