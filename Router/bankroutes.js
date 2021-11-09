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
router.post("/deactivatebalancesheet", bankController.deactivatebalanceSheet);
router.post("/activatebalancesheet", bankController.ActivateBalancesheet);

module.exports = router;
