var express = require("express");
const B_Sheet = require("../Schema/balanceSheetSchema");
const User = require("../Schema/User_schema");
const Evalid = require("../email_validator");
const BAccount = require("../Schema/bankAccount");
const transaction = require("../Schema/transactionScehema");
const { findOne } = require("../Schema/User_schema");

var app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// creating transaction
exports.CreatBalanceSheet = async function (req, res) {
  //res.send(req.body);

  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.type == "" || req.body.type == undefined) {
    res.status(400).send("Missing Type:: Try again");
    return;
  } else if (req.body.type == "salary" || req.body.type == "current") {
    await User.findOne({ Email: req.body.email })
      .then((userU) => {
        if (!userU || userU == null) {
          return res
            .status(500)
            .send("You are not our User... or Email is not registered.");
        } else {
          B_Sheet.findOne({ user_id: userU._id }).then((userB) => {
            if (!userB || userB == null) {
              //balance sheet user not present
              let bankAccount;
              if (req.body.type == "salary") {
                bankAccount = new B_Sheet({
                  user_id: userU._id,
                  salary: { type: true },
                });
              } else if (req.body.type == "current") {
                bankAccount = new B_Sheet({
                  user_id: userU._id,
                  current: { type: true },
                });
              }

              bankAccount
                .save()
                .then((events) => {
                  res
                    .status(200)
                    .json({ success: "Your Bank Account Created" });
                })
                .catch((err) => {
                  console.log(err);
                  // res.send("error");
                  res.end();
                });
            } else {
              // balance sheet user present user
              if (req.body.type == "salary") {
                B_Sheet.updateOne(
                  { _id: userB._id },
                  { salary: { type: true } }
                ).then((sal) => {
                  return res.status(200).json({
                    success: `Your  ${req.body.type} balance sheet created`,
                  });
                });
              } else if (req.body.type == "current") {
                B_Sheet.updateOne(
                  { _id: userB._id },
                  { current: { type: true } }
                ).then(() => {
                  return res.status(200).json({
                    success: `Your  ${req.body.type} balance sheet created`,
                  });
                });
              }
            }
          });
        }
      })
      .catch(() => {
        console.log("error");
        res.send("error");
      });
    console.log("end");
  } else {
    res
      .status(400)
      .send("Account should be 'salary' or 'current' (lowercase) ");
    return;
  }
};

exports.deactivatebalanceSheet = async function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.account == "salary" || req.body.account == "current") {
    await User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        B_Sheet.findOne({ user_id: userU._id }).then((userB) => {
          if (!userB || userB == null) {
            res
              .status(400)
              .send("You don't have a balance sheet accounts created");
            return;
          } else {
            if (req.body.account == "salary") {
              if (userB.salary.type == true) {
                userB.salary.type = false;
                userB.save();
                res.status(400).send(`You salary account deactivated `);
              } else {
                res.status(400).send(`You don't have salary account created`);
                return;
              }
            }

            if (req.body.account == "current") {
              if (userB.current.type == true) {
                userB.current.type = false;
                userB.save();
                res.status(400).send(`You current account deactivated `);
              } else {
                res.status(400).send(`You don't have current account created`);
                return;
              }
            }
          }
        });
      }
    });
  } else {
    res
      .status(400)
      .send("Account should be 'salary' or 'current' (lowercase) ");
    return;
  }
};

exports.ActivateBalancesheet = async function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.account == "salary" || req.body.account == "current") {
    await User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        B_Sheet.findOne({ user_id: userU._id }).then((userB) => {
          if (!userB || userB == null) {
            res
              .status(400)
              .send("You don't have a balance sheet accounts created");
            return;
          } else {
            if (req.body.account == "salary") {
              if (userB.salary.type == false) {
                userB.salary.type = true;
                userB.save();
                res.status(400).send(`You salary account Activated `);
              } else {
                res.status(400).send(`You Already have salary account created`);
                return;
              }
            }

            if (req.body.account == "current") {
              if (userB.current.type == false) {
                userB.current.type = true;
                userB.save();
                res.status(400).send(`You current account Activated `);
              } else {
                res
                  .status(400)
                  .send(`You already have current account created`);
                return;
              }
            }
          }
        });
      }
    });
  } else {
    res
      .status(400)
      .send("Account should be 'salary' or 'current' (lowercase) ");
    return;
  }
};

// by reference with new schema of bank account
exports.createB = async (req, res) => {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.accountName == "" || req.body.accountName == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else {
    User.findOne({ Email: req.body.email }, (err, user) => {
      if (user) {
        // The below two lines will add the newly saved review's
        // ObjectID to the the User's reviews array field
        BAccount.findOne(
          { accountName: req.body.accountName },
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
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  }
  // } else if (req.body.accountname == "" || req.body.accountname == undefined) {
  //   res.status(400).send("Account name missing ::: Try Again ");
  //   return;
  // } else if (req.body.category == "" || req.body.category == undefined) {
  //   res.status(400).send("Transaction category missing ::: Try Again ");
  //   return;
  else {
    User.findOne({ Email: req.body.email }).then((userU) => {
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
  }
};

exports.delete_bankaccount = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  }
  // } else if (req.body.category == "" || req.body.category == undefined) {
  //   res.status(400).send("Transaction category missing ::: Try Again ");
  //   return;
  else {
    User.findOne({ Email: req.body.email }).then((userU) => {
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
