const express = require("express");
const router = express.Router();
const userController = require("../Controller/user_controlls");
router.use(
  express.urlencoded({
    extended: true,
  })
);
//routing User  to controller
router.post("/signup", userController.signup); // generating token
router.put("/resetPass", userController.reset_pass);
router.get("/ForgetPass", userController.forget_pass);
router.post("/login", userController.login); // generating token


module.exports = router;
