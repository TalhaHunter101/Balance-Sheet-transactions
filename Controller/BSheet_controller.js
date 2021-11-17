var express = require("express");
const User = require("../Schema/User_schema");
const Evalid = require("../email_validator");
const BAccount = require("../Schema/bankAccount");
const transaction = require("../Schema/transactionScehema");

var app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// by reference with new schema of bank account
exports.createB = async (req, res) => {
  const useremail = req.user.emil;
  if (req.body.accountName == "" || req.body.accountName == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else {
    User.findOne({ Email: useremail }, (err, user) => {
      if (user) {
        // The below two lines will add the newly saved review's
        // ObjectID to the the User's reviews array field
        BAccount.findOne(
          { _id: { $in: user.BankAccount }, accountName: req.body.accountName },
          (err, expre) => {
            if (!expre) {
            const review = new BAccount();
            review.accountName = req.body.accountName;
            // review.balance = req.body.balance;
            review.owner = user._id;
            user.BankAccount.push(review);
            user.save();
            review.save();
            res.json({ message: "New bank Account created!" });
            } else {
              return res.json({
                message: "Your bank account already present!",
              });
            }
          }
        );
      }
    });
  }
};

exports.find_all_bankaccounts = function (req, res) {
  const useremail = req.user.emil;

  User.findOne({ Email: useremail }).then((userU) => {
    if (!userU || userU == null) {
      return res
        .status(500)
        .send("You are not our User... or Email is not registered.");
    } else {
      if (userU.BankAccount == "") {
        res.status(400).send("You dont have any bank Account  ");
        return;
      } else {
        // salary or current
        BAccount.find(
          {
            _id: { $in: userU.BankAccount },
            // accountName: req.body.accountname,
          },
          (err, docs) => {
            if (docs) {
              res.send(`Your bank Accounts details are : ${docs}`);
            } else {
              res.send("No account Found ");
            }
          }
        );
      }
    }
  });
};

exports.delete_bankaccount = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        if (userU.BankAccount == "") {
          res.status(400).send("You dont have any bank Account  ");
          return;
        } else {
          // salary or current
          BAccount.findOneAndDelete(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              if (docs) {
                transaction.deleteMany(
                  {
                    _id: { $in: docs.Transaction },
                    // T_Type: req.body.T_type,
                  },
                  (err, find) => {
                    if (find) {
                      res.send(`Your bank account deleted`);
                    } else {
                      res.send(`No Transaction Found `);
                    }
                  }
                );
              } else {
                res.send("No account Found ");
              }
            }
          );
        }
      }
    });
  }
};

exports.find_specific_bankaccount = async (req, res) => {
  const useremail = req.user.emil;
  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(405).send("Account Name missing :: Enter again");
    return;
  } else {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        if (userU.BankAccount == "") {
          res.status(400).send("You dont have any bank Account  ");
          return;
        } else {
          // salary or current
          BAccount.find(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              if (docs) {
                res
                  .status(200)
                  .send(`Your bank Accounts details are : ${docs}`);
              } else {
                res.send("No account Found ");
              }
            }
          );
        }
      }
    });
  }
};
