const mongoose = require("mongoose");
const F_pass_token = new mongoose.Schema(
  {
    Token: {
      type: Number,
      required: true,
    },
    Owner_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const F_token = mongoose.model("F_token", F_pass_token);
module.exports = F_token;
