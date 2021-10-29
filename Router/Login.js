const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Evalid = require("../email_validator");
const User = require("../Schema/User_schema");

router.use("", (req, res) => {
  console.log(req.body);

  if (req.body.email == "" || req.body.email == undefined) {
    res.send("Missing Email:: Try again");
    return;
  } else if (req.body.password == "" || req.body.password == undefined) {
    res.send("Missing Password:: Try again");
    return;
  } else if (req.body.password.length < 6) {
    res.send("password should be at least 6 characters");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.send("Incorrect email :: Enter again");
    return;
  }

  User.findOne({ Email: req.body.email }).then((user) => {
    // console.log(user);
    if (user || user != null) {
      // user Found in record
      //console.log(`req ${req.body.password}      db      ${user.Password}`);

      const verifypass = bcrypt.compareSync(req.body.password, user.Password);

      if (!verifypass) {
        res.status(200).send("Login password incorrect or missing");
        return;
        //console.log(verifypass);
      } else if (verifypass) {
        res.status(201).send(`Login succesfull. Welcome ${user.Full_name}`);
      }
      //res.send(`Welcome :: ${user.Full_name} \n You are logged in...`);
    } else {
      res.send("You are not registered. Go Signup first");
      return;
    }
  });
});

module.exports = router;
