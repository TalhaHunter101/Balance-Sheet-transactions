const express = require("express");
const app = express();
const PORT = 6000;
const mongo = require("./Database/mongo_conn");

app.use("/user", require("./Router/user_router"));

app.listen(PORT, () => {
  console.log(`Server is starting at : ${PORT} `);
});
