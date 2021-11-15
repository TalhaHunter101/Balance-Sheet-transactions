const express = require("express");
const router = express.Router();
const transactionController = require("../Controller/transactionController");
router.use(
  express.urlencoded({
    extended: true,
  })
);

//routing User  to controller
router.post("/createtransaction", transactionController.Creattransaction);
router.post("/findBycategory", transactionController.findbycategory);
router.post("/findbydate", transactionController.findbydate);
router.post("/findtransaction", transactionController.findtransaction);
router.post("/updatetransaction", transactionController.updatetransaction);



/// New transaction controller according to new schema  
router.post("/new_transaction", transactionController.new_transaction);
router.post("/find_by_type", transactionController.find_all_transaction_by_type);
router.post("/find_by_category", transactionController.find_all_transaction_by_category);
router.post("/update_transaction", transactionController.Update_transaction);
router.post("/find_by_dates", transactionController.find_transaction_by_date);
module.exports = router;
