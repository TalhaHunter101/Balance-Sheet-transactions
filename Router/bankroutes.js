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



// new try with different schema
router.post("/createB", bankController.createB);
router.post("/find_all_bankaccount", bankController.find_all_bankaccounts);
router.post("/delete_bankaccount", bankController.delete_bankaccount);

module.exports = router;
