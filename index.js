const express = require("express");
const app = express();
const PORT = 4000;
const db = require("./DB/MongoConn");
const csrf = require("csrf");
const expressSession = require("express-session");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/Login", require("./Router/Login"));
app.use("/Signup", require("./Router/Signup"));
app.use("/Reset", require("./Router/Reset_password"));
app.use("/Forget", require("./Router/Forget_password"));

app.listen(PORT, () => {
  console.log(`Server is starting at : ${PORT} `);
});
