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
// router.post("/createTransaction", bankController.createTransaction);

module.exports = router;
