const express = require("express");
const db = require("./db");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
app.post("/", (req, res) => {
  console.log(req.body);
  res.send({ message: "success" });
});

// Routes modules in the app
app.use("/", require("./Router/Register"));
app.use("/Login", require("./Router/Login"));
app.use("/Forget_password", require("./Router/Forget_password"));
app.use("/Reset_password", require("./Router/Reset_password"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is starting at ${PORT}`);
});
