const express = require("express");
const router = express.Router();
const bankController = require("../Controller/BSheet_controller");
const auth = require("../Middlewares/auth");
router.use(
  express.urlencoded({
    extended: true,
  })
);
// new try with different schema
router.post("/createB", auth, bankController.createB);
router.post(
  "/find_all_bankaccount",
  auth,
  bankController.find_all_bankaccounts
);
router.post("/delete_bankaccount", auth, bankController.delete_bankaccount);
router.post("/find_specific_account", auth, bankController.find_specific_bankaccount);
module.exports = router;
