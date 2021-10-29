const express = require("express");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Talha:talha@cluster0.41roq.mongodb.net/LoginApp",
  {
    useNewUrlParser: true,
  }
);
var conn = mongoose.connection;
conn.on("connected", function () {
  console.log("database is connected successfully");
});
conn.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
conn.on("error", console.error.bind(console, "Databse connection error:"));
module.exports = conn;
