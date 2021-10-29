const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const emailvalidator = require("../validator_function");
const User = require("../Schema/user");

router.post("", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  //res.send(`body recieved ${(email, password)}`);

  if (!email || !password) {
    return res.status(300).json({ msg: "Please enter all fields" });
  } else if (emailvalidator.validateEmailAddress(email) === -1) {
    return res.send("Email not valid:: enter again");
  } else if (password.length < 6) {
    return res.status(201).json({
      msg: "Password must be at least 6 characters: incorrewct password format ",
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        res.status(200).send("You are not registered:: Go Signup...");
      } else {
        const verifypass = bcrypt.compareSync(password, user.password);

        if (!verifypass || password == "" || password == undefined) {
          res.status(200).send("Login password incorrect or missing");
          return;
          //console.log(verifypass);
        } else if (verifypass) {
          res.status(201).send(`Login succesfull. Welcome ${user.name}`);
        }
      }
    });
  }
});

module.exports = router;
