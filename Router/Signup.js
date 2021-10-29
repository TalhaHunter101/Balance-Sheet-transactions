const express = require("express");
const router = express.Router();
const Evalid = require("../email_validator");
const User = require("../Schema/User_schema");

router.post("", (req, res) => {
  console.log(req.body);
  //res.send("data recieved");

  if (req.body.Full_name == "" || req.body.Full_name == undefined) {
    res.send("Missing Full Name: try Again");
    return;
  }
  if (req.body.Email == "" || req.body.Email == undefined) {
    res.send("Missing Email:: Try again");
    return;
  }
  if (req.body.Password == "" || req.body.Password == undefined) {
    res.send("Missing Password:: Try again");
    return;
  }
  if (Evalid.validateEmailAddress(req.body.Email) === -1) {
    res.send("Incorrect email :: Enter again");
    return;
  }

  User.findOne({ Email: req.body.Email }).then((user) => {
   // console.log(user);
    if (user || user != null) {
      return res.send("You are already registered...");
    } else {
      let NewUser = new User({
        Full_name: req.body.Full_name,
        Email: req.body.Email,
        Password: req.body.Password,
      });
      NewUser.save()
        .then((events) => {
          res.json({ success: "You are registered:: Go to Login" });
        })
        .catch((err) => {
          console.log(err);
          // res.send("error");
          res.end();
        });
    }
  });
});

module.exports = router;
