const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let bankAccount = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    accountName: { type: String, required: true }, // primary key
    balance: { type: Number, default: 0 },
    Transaction: [{ type: Schema.Types.ObjectId, ref: "transaction" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("bAccount", bankAccount);
