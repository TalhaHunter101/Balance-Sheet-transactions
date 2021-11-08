const express = require("express");
const router = express.Router();
const bankController = require("../Controller/BSheet_controller");
router.use(
  express.urlencoded({
    extended: true,
  })
);

//routing User  to controller
router.post("/CreateBankAccount", bankController.CreatBalanceSheet);

// router.post("/ViewBankAccount", bankController.ViewBankAccount);
// router.post("/createTransaction", bankController.createTransaction);

module.exports = router;
