const express = require("express");
const router = express.Router();
const User = require("../Schema/user");
const emailvalidator = require("../validator_function");
const { model } = require("mongoose");
const app = express();

router.post("/register", (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  //res.send("data recieved");

  if (!name || !email || !password) {
    return res.status(300).json({ msg: "Please enter all fields" });
  } else if (emailvalidator.validateEmailAddress(email) === -1) {
    return res.send("Email not valid:: enter again");
  } else if (password.length < 6) {
    return res
      .status(201)
      .json({ msg: "Password must be at least 6 characters" });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        res.status(200).send("Your email already registered:: Go Login...");
        return;
      } else {
        const newUser = new User({ name, email, password });
        newUser.save().then((user) => {
          res.status(100).json({ msg: "SIGNUP SUCCESSFULL :::::::::::::" });         
        });
      }
    });
  }
});

module.exports = router;
