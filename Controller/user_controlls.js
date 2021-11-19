const User = require("../Schema/User_schema");
const token = require("../Schema/Token_schema");
const Evalid = require("../email_validator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const crypto = require("crypto");
const mailgun = require("mailgun-js");
var express = require("express");
var jwt = require("jsonwebtoken");
const config = process.env;
var app = express();
dotenv.config();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// user Sign up and Sign in controlls
exports.signup = function (req, res) {
  if (req.body.fullName == "" || req.body.fullName == undefined) {
    res.status(400).json({ Message: "Missing Full Name: try Again" });
    return;
  }
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(400).json({ Message: "Missing Email:: Try again" });
    return;
  }
  if (req.body.password == "" || req.body.password == undefined) {
    res.status(400).json({ Message: "Missing Password:: Try again" });
    return;
  }
  if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(400).json({ Message: "Incorrect email :: Enter again" });
    return;
  }
  User.findOne({ Email: req.body.email }).then((user) => {
    if (user) {
      // user already present
      return res
        .status(409)
        .json({ Message: "You are already registered ..." });
    } else {
      // creating new
      let NewUser = new User({
        Full_name: req.body.fullName,
        Email: req.body.email,
        Password: req.body.password,
      });
      const emil = req.body.email;
      const token = jwt.sign(
        { user_id: NewUser._id, emil },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "2h",
        }
      );
      NewUser.save()
        .then((events) => {
          res.status(200).json({
            Message: `User registered`,
            Token: `${token}`,
          });
        })
        .catch((err) => {
          console.log(err);
          res.end();
        });
    }
  });
};

exports.reset_pass = function (req, res) {
  console.log(req.body);
  const { password, c_password, Token } = req.body;

  if (!password || !c_password || !Token) {
    return res.status(400).json({ Message: "Please enter all fields" });
  } else if (password != c_password) {
    return res
      .status(400)
      .json({ Message: "Password mismatched :: Enter Again" });
  } else if (password.length < 6 || c_password.length < 6) {
    return res.status(400).json({
      Message: "Passward length should be 6 char minimum:: Enter again",
    });
  } else {
    // yaha per haie ab ham
    token
      .findOne({ Token })
      .then((userT) => {
        if (userT === null || !userT) {
          res
            .status(404)
            .json({ Message: "Token is incorrect ::: Enter Again" });
        } else {
          const hashpass = bcrypt.hashSync(password, 10);
          console.log(hashpass);
          User.findByIdAndUpdate(
            userT.Owner_id,
            { Password: hashpass },
            (err, docx) => {
              if (!docx) {
                console.log(err);
                res
                  .status(404)
                  .json({ Message: "User with token not found.." });
              } else {
                token.findByIdAndDelete(userT._id, (err, docs) => {
                  if (err) {
                    res
                      .status(400)
                      .json({ Message: "Error in deletion of token" });
                  } else {
                    res
                      .status(200)
                      .json({ Message: "Password Changed and token cleared" });
                  }
                });
              }
            }
          );
        }
      })
      .catch();
  }
};

exports.login = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(400).json({ Message: "Missing Email : Enter again" });
    return;
  } else if (req.body.password == "" || req.body.password == undefined) {
    res.status(400).json({ Message: "Missing Password : Enter again" });
    return;
  } else if (req.body.password.length < 6) {
    res
      .status(411)
      .json({ Message: "Password should be at least 6 characters" });
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(400).json({ Message: "Email format invalid  :: Enter again" });
    return;
  }
  User.findOne({ Email: req.body.email }).then((user) => {
    if (user) {
      // user Found in record
      const verifypass = bcrypt.compareSync(req.body.password, user.Password);
      if (verifypass == true) {
        const emil = req.body.email;
        const token = jwt.sign(
          { user_id: user._id, emil },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({
          Message: `Login succesfull :: Welcome ${user.Full_name} `,
          Token: `${token}`,
        });
      } else {
        res.status(400).json({
          Message: `Incorrect Credentials`,
        });
      }
    } else {
      res.status(400).json({ Message: "You are not our registered user" });
      return;
    }
  });
};
exports.forget_pass = function (req, res) {
  const { email } = req.body;
  var tooken;
  const DOMAIN = "sandbox582feb5a5e3746b58635b2b00cecbf75.mailgun.org";
  const mg = mailgun({
    apiKey: "2f3acefac4159e2a390fb109938ef396-20ebde82-c497ec49",
    domain: DOMAIN,
  });

  if (!email) {
    return res.status(400).json({ Message: "Please provide email address" });
  } else if (Evalid.validateEmailAddress(email) === -1) {
    return res.status(400).json({ Message: "Email not valid:: Enter again" });
  } else {
    User.findOne({ Email: email })
      .then((user) => {
        if (!user) {
          res
            .status(404)
            .json({ Message: "You are not registered:: Go Signup..." });
          return;
        } else {
          token
            .findOne({ Owner_id: user._id })
            .then(function (F_id) {
              if (F_id) {
                res.status(502).json({
                  Message: "Your token already sent.. Check your email",
                });
                return;
              }
              if (!F_id) {
                tooken = crypto.randomBytes(48).toString("hex");
                const data = {
                  from: "noreply@gmail.com",
                  to: email,
                  subject: "Reset Password Token",
                  text: `Your password reset token is ::: ${tooken}`,
                };
                let F_token = new token({
                  Token: tooken,
                  Owner_id: user._id,
                });
                F_token.save().then((user) => {
                  mg.messages().send(data, function (error, body) {
                    console.log(body);
                  });

                  res.status(200).json({
                    Message: `Visit this Link to reset password: http://localhost:5000/Reset_password Your token is  sent to ${email}`,
                  });
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
        res.json({ Message: "Errorrrr.." });
        res.end();
      });
  }
};
