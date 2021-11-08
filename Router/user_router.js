const express = require("express");
const router = express.Router();
const userController = require("../Controller/user_controlls");
router.use(
  express.urlencoded({
    extended: true,
  })
);

//routing User  to controller
router.post("/signup", userController.signup);
router.post("/resetPass", userController.reset_pass);
router.post("/ForgetPass", userController.forget_pass);
router.post("/login", userController.login);

module.exports = router;
