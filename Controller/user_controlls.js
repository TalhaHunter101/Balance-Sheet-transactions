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
  if (req.body.Full_name == "" || req.body.Full_name == undefined) {
    res.status(404).send("Missing Full Name: try Again");
    return;
  }
  if (req.body.Email == "" || req.body.Email == undefined) {
    res.status(403).send("Missing Email:: Try again");
    return;
  }
  if (req.body.Password == "" || req.body.Password == undefined) {
    res.status(400).send("Missing Password:: Try again");
    return;
  }
  if (Evalid.validateEmailAddress(req.body.Email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  }
  User.findOne({ Email: req.body.Email }).then((user) => {
    if (user) {
      // user already present
      return res.status(500).send("You are already registered ...");
    } else {
      // creating new
      let NewUser = new User({
        Full_name: req.body.Full_name,
        Email: req.body.Email,
        Password: req.body.Password,
      });
      const emil = req.body.Email;
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
            success: `User registered :: `,
            Token: `Your authentication token is : ${token} `,
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
    return res.status(300).json({ msg: "Please enter all fields" });
  } else if (password != c_password) {
    return res.status(404).json({ msg: "Password Mismatched:: Enter again" });
  } else if (password.length < 6 || c_password.length < 6) {
    return res.status(402).json({
      msg: "Passward length should be 8 char minimum:: Enter again",
    });
  } else {
    // yaha per haie ab ham
    token
      .findOne({ Token })
      .then((userT) => {
        console.log(userT._id);
        if (userT === null || !userT) {
          res.status(501).send("Token is incorrect::: Enter Again");
        } else {
          const hashpass = bcrypt.hashSync(password, 10);

          User.findByIdAndUpdate(
            userT.Owner_id,
            { Password: hashpass },
            (err, docx) => {
              if (!docx) {
                console.log(err);
                res.send("User with token not found..");
              } else {
                res.send("Password Changed.....");
                token.findByIdAndDelete(userT._id, (err, docs) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(
                      "Password changed and token deleted from token db"
                    );
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
  console.log(req.body);

  if (req.body.email == "" || req.body.email == undefined) {
    res.status(400).send("Invalid Details:: Try again");
    return;
  } else if (req.body.password == "" || req.body.password == undefined) {
    res.status(406).send("Invalid Details::: Try again");
    return;
  } else if (req.body.password.length < 6) {
    res.status(401).send("Password should be at least 6 characters");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(408).send("Invalid Details: :: Enter again");
    return;
  }
  User.findOne({ Email: req.body.email }).then((user) => {
    // console.log(user);
    if (user) {
      // user Found in record
      const verifypass = bcrypt.compareSync(req.body.password, user.Password);
      if (!verifypass) {
        res.status(500).send("Invalid Details:::");
        return;
        //console.log(verifypass);
      } else if (verifypass) {
        const emil = req.body.email;
        const token = jwt.sign(
          { user_id: user._id, emil },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "2h",
          }
        );
        res.status(201).json({
          mesg: `Login succesfull. Welcome ${user.Full_name} `,
          Token: `Your Authentication Token is : ${token}`,
        });
      }
      //res.send(`Welcome :: ${user.Full_name} \n You are logged in...`);
    } else {
      res.status(402).send("Invalid Details:::");
      return;
    }
  });
};
exports.forget_pass = function (req, res) {
  const { email } = req.body;
  console.log(req.body);
  //res.send(`body recieved ${(email, password)}`);
  var tooken;
  const DOMAIN = "sandbox582feb5a5e3746b58635b2b00cecbf75.mailgun.org";
  const mg = mailgun({
    apiKey: "2f3acefac4159e2a390fb109938ef396-20ebde82-c497ec49",
    domain: DOMAIN,
  });

  if (!email) {
    return res.status(300).json({ msg: "Please provide email address" });
  } else if (Evalid.validateEmailAddress(email) === -1) {
    return res.send("Email not valid:: Enter again");
  } else {
    User.findOne({ Email: email })
      .then((user) => {
        if (!user) {
          res.status(200).send("You are not registered:: Go Signup...");
          return;
        } else {
          token
            .findOne({ Owner_id: user._id })
            .then(function (F_id) {
              if (F_id) {
                res
                  .status(403)
                  .send("Your token already sent.. Check your email");
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

                  res
                    .status(444)
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
        res.send("Errorrrr..");
        res.end();
      });
  }
};
