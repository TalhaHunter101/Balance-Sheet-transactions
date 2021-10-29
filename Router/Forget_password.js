const express = require("express");
const rout = express.Router();
const User = require("../Schema/user");
const F_token = require("../Schema/F_Pass_token");
const emailvalidator = require("../validator_function");
const { model } = require("mongoose");
const app = express();
const mailgun = require("mailgun-js");
require("dotenv").config();

var token;
const DOMAIN = "sandbox582feb5a5e3746b58635b2b00cecbf75.mailgun.org";
const mg = mailgun({
  apiKey: "2f3acefac4159e2a390fb109938ef396-20ebde82-c497ec49",
  domain: DOMAIN,
});

rout.post("", (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  //res.send(`body recieved ${(email, password)}`);

  if (!email) {
    return res.status(300).json({ msg: "Please provide email" });
  } else if (emailvalidator.validateEmailAddress(email) === -1) {
    return res.send("Email not valid:: Enter again");
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          res.status(200).send("You are not registered:: Go Signup...");
          return;
        } else {
          F_token.findOne({ Owner_id: user._id })
            .then(function (F_id) {
              if (F_id) {
                res
                  .status(203)
                  .send("Your token already sent.. Check your email");
                return;
              }
              if (!F_id) {
                token = Math.floor(1000 + Math.random() * 9000);
                const data = {
                  from: "noreply@gmail.com",
                  to: email,
                  subject: "Reset Password Token",
                  text: `Your password reset token is  :::   ${token}`,
                };

                let F_Token = new F_token({
                  Token: token,
                  Owner_id: user._id,
                });

                F_Token.save().then((user) => {
                  mg.messages().send(data, function (error, body) {
                    console.log(body);
                  });

                  res
                    .status(678)
                    .send(
                      `Visit this Link to reset password: http://localhost:5000/Reset_password Your token is  sent to ${email}`
                    );
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.end();
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.send("Errorrrr....");
        res.end();
      });
  }
});

module.exports = rout;
