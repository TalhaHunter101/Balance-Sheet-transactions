const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth");

const transactionController = require("../Controller/transactionController");
router.use(
  express.urlencoded({
    extended: true,
  })
);

/// New transaction controller according to new schema
router.post("/new_transaction",auth, transactionController.new_transaction);
router.post(
  "/find_by_type",
  auth,
  transactionController.find_all_transaction_by_type
);
router.post(
  "/find_by_category",
  auth,
  transactionController.find_all_transaction_by_category
);
router.post(
  "/update_transaction",
  auth,
  transactionController.Update_transaction
);
router.post(
  "/find_by_dates",
  auth,
  transactionController.find_transaction_by_date
);
router.post(
  "/delete_by_transaction",
  auth,
  transactionController.Delete_tansaction
);
module.exports = router;
