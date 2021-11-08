const express = require("express");
const app = express();
const PORT = 7000;
const mongo = require("./Database/mongo_conn");

// rendering routes
app.use("/user", require("./Router/user_router"));
app.use("/user/bankaccount", require("./Router/bankroutes"));
app.use("/user/bankaccount/transaction", require("./Router/transactionRoutes"));

// Listening on this port
app.listen(PORT, () => {
  console.log(`Server is starting at : ${PORT} `);
});
