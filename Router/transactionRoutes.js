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
router.get(
  "/find_by_type",
  auth,
  transactionController.find_all_transaction_by_type
);
router.get(
  "/find_by_category",
  auth,
  transactionController.find_all_transaction_by_category
);
router.put(
  "/update_transaction",
  auth,
  transactionController.Update_transaction
);
router.get(
  "/find_by_dates",
  auth,
  transactionController.find_transaction_by_date
);
router.delete(
  "/delete_by_transaction",
  auth,
  transactionController.Delete_tansaction
);
router.get(
  "/find_transaction_allfilter",
  auth,
  transactionController.find_transaction_filter_all
);
module.exports = router;
