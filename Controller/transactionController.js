var express = require("express");
const transaction = require("../Schema/transactionScehema");
const B_Sheet = require("../Schema/balanceSheetSchema");
const User = require("../Schema/User_schema");
const Evalid = require("../email_validator");
const BAccount = require("../Schema/bankAccount");
var moment = require("moment"); // require
const today = moment();
var app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// creating transaction

exports.Creattransaction = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.amount == "" || req.body.amount == undefined) {
    res.status(405).send("Amount of transaction missing :: Enter again");
    return;
  } else if (req.body.amount < 0 || req.body.amount > 9999999999) {
    res.status(405).send("Amount of transaction missing :: Enter again");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).send("CATEGORY mISSING:: Try again");
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res.status(400).send("dISCRIPTION mISSING:: Try again");
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
    User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        // salary or current
        if (req.body.B_type == "salary") {
          // check for salary
          B_Sheet.findOne({ user_id: userU._id, "salary.type": true }).then(
            (userB) => {
              console.log(userB.salary.type);
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT FOR THE TRANSACTION.`
                  );
              } // balance sheet present
              else {
                transaction
                  .findOne({ bank_id: userB._id })
                  .then((transactionT) => {
                    if (req.body.T_type == "expense") {
                      // old transaction present
                      if (transactionT) {
                        transactionT.Expense.push({
                          ammount: req.body.amount,
                          Date: Date.now(),
                          description: req.body.description,
                          category: req.body.category,
                        });
                        transactionT.save();
                        userB.salary.Transaction.push(transactionT._id);
                        userB.salary.balance -= req.body.amount;
                        userB.save();
                        res.status(200).json({
                          success: `Your ${req.body.T_type} transaction Completed.`,
                        });
                      } else {
                        // new transaction
                        trans = new transaction({
                          bank_id: userB._id,
                          Expense: [
                            {
                              ammount: req.body.amount,
                              Date: Date.now(),
                              description: req.body.description,
                              category: req.body.category,
                            },
                          ],
                        });
                        trans
                          .save()
                          .then((events) => {
                            userB.salary.Transaction.push(trans._id);
                            userB.salary.balance -= req.body.amount;
                            userB.save();
                            res.status(200).json({
                              success: `Your ${req.body.T_type} transaction Completed.`,
                            });
                            return;
                          })
                          .catch((err) => {
                            console.log(err);
                            // res.send("error");
                            res.end();
                          });
                      }
                      // insert expense present
                    } else if (req.body.T_type == "income") {
                      // insert income already present
                      if (transactionT) {
                        transactionT.Income.push({
                          ammount: req.body.amount,
                          Date: today.format("DD-MM-YYYY"),
                          description: req.body.description,
                          category: req.body.category,
                        });
                        transactionT.save();
                        userB.salary.Transaction.push(transactionT._id);
                        userB.salary.balance += req.body.amount;
                        userB.save();
                        res.status(200).json({
                          success: `Your ${req.body.T_type} transaction Completed.`,
                        });
                      } else {
                        // new transaction
                        trans = new transaction({
                          bank_id: userB._id,
                          Income: [
                            {
                              ammount: req.body.amount,
                              Date: today.format("DD-MM-YYYY"),
                              description: req.body.description,
                              category: req.body.category,
                            },
                          ],
                        });
                        trans
                          .save()
                          .then((events) => {
                            userB.salary.Transaction.push(trans._id);
                            userB.salary.balance += req.body.amount;
                            userB.save();
                            res.status(200).json({
                              success: `Your ${req.body.T_type} transaction Completed.`,
                            });
                            return;
                          })
                          .catch((err) => {
                            console.log(err);
                            // res.send("error");
                            res.end();
                          });
                      }
                    }
                  });
              }
            }
          );
        } else if (req.body.B_type == "current") {
          B_Sheet.findOne({ user_id: userU._id, "current.type": true }).then(
            (userB) => {
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT FOR THE TRANSACTION.`
                  );
              } // balance sheet present
              else {
                transaction
                  .findOne({ bank_id: userB._id })
                  .then((transactionT) => {
                    if (req.body.T_type == "expense") {
                      // old transaction present
                      if (transactionT) {
                        transactionT.Expense.push({
                          ammount: req.body.amount,
                          Date: today.format("DD-MM-YYYY"),
                          description: req.body.description,
                          category: req.body.category,
                        });
                        transactionT.save();
                        userB.current.Transaction.push(transactionT._id);
                        userB.current.balance -= req.body.amount;
                        userB.save();
                        res.status(200).json({
                          success: `Your ${req.body.T_type} transaction Completed.`,
                        });
                      } else {
                        // new transaction
                        trans = new transaction({
                          bank_id: userB._id,
                          Expense: [
                            {
                              ammount: req.body.amount,
                              Date: today.format("DD-MM-YYYY"),
                              description: req.body.description,
                              category: req.body.category,
                            },
                          ],
                        });
                        trans
                          .save()
                          .then((events) => {
                            userB.current.Transaction.push(trans._id);
                            userB.current.balance -= req.body.amount;
                            userB.save();
                            res.status(200).json({
                              success: `Your ${req.body.T_type} transaction Completed.`,
                            });
                            return;
                          })
                          .catch((err) => {
                            console.log(err);
                            // res.send("error");
                            res.end();
                          });
                      }
                      // insert expense present
                    } else if (req.body.T_type == "income") {
                      // insert income already present
                      if (transactionT) {
                        transactionT.Income.push({
                          ammount: req.body.amount,
                          Date: today.format("DD-MM-YYYY"),
                          description: req.body.description,
                          category: req.body.category,
                        });
                        console.log(transactionT._id);
                        transactionT.save();
                        userB.current.Transaction.push(transactionT._id);
                        userB.current.balance += req.body.amount;

                        userB.save();
                        res.status(200).json({
                          success: `Your ${req.body.T_type} transaction Completed.`,
                        });
                      } else {
                        // new transaction
                        trans = new transaction({
                          bank_id: userB._id,
                          Income: [
                            {
                              ammount: req.body.amount,
                              Date: today.format("DD-MM-YYYY"),
                              description: req.body.description,
                              category: req.body.category,
                            },
                          ],
                        });
                        trans
                          .save()
                          .then((events) => {
                            userB.current.Transaction.push(trans._id);
                            userB.current.balance += req.body.amount;
                            userB.save();
                            res.status(200).json({
                              success: `Your ${req.body.T_type} transaction Completed.`,
                            });
                            return;
                          })
                          .catch((err) => {
                            console.log(err);
                            // res.send("error");
                            res.end();
                          });
                      }
                    }
                  });
              }
            }
          );
        }
      }
    });
  }
};

exports.findbycategory = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.B_type == "" || req.body.B_type == undefined) {
    res.status(405).send("Balance Sheet type is mussing :: Enter again");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(405).send("Category of transaction missing :: Enter again");
    return;
  } else {
    User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        // user Found
        // salary or current
        if (req.body.B_type == "salary") {
          B_Sheet.findOne({ user_id: userU._id, "salary.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT `
                  );
              } else {
                // balance Sheet record found
                console.log(userB.current.Transaction._id);
                transaction
                  .find({
                    bank_id: userB._id,
                    "Expense.category": req.body.category,
                  })
                  .then((found) => {
                    if (!found) {
                      transaction
                        .find({
                          bank_id: userB._id,
                          "Income.category": req.body.category,
                        })
                        .then((found) => {
                          if (!found) {
                            return res
                              .status(500)
                              .send(`Your desired category not found`);
                          } else {
                            return res.send(found);
                          }
                        });
                    } else {
                      return res.send(found);
                    }
                  });
              }
            }
          );
        } else if (req.body.B_type == "current") {
          B_Sheet.findOne({ user_id: userU._id, "current.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT .`
                  );
              } else {
                // balance Sheet record found
                console.log(userB.current.Transaction);
                //res.send(userB);
                transaction
                  .find({
                    bank_id: userB._id,
                    "Expense.category": req.body.category,
                  })
                  .then((found) => {
                    if (!found) {
                      transaction
                        .find({
                          bank_id: userB._id,
                          "Income.category": req.body.category,
                        })
                        .then((found) => {
                          if (!found) {
                            return res
                              .status(500)
                              .send(`Your desired category not found`);
                          } else {
                            return res.send(found);
                          }
                        });
                    } else {
                      return res.send(found);
                    }
                  });
              }
            }
          );
        }
      }
    });
  }
};

exports.findbydate = function (req, res, next) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.date_start == "" || req.body.date_start == undefined) {
    res.status(405).send("Start date is mussing :: Enter again");
    return;
  } else if (req.body.date_end == "" || req.body.date_end == undefined) {
    res.status(405).send("End date missing :: Enter again");
    return;
  } else if (moment(req.body.date_start, "DD-MM-YYYY").isValid() == false) {
    res.status(405).send("Start date format should be DD-MM-YYYY");
    return;
  } else if (moment(req.body.date_end, "DD-MM-YYYY").isValid() == false) {
    res.status(405).send("End date format should be DD-MM-YY");
    return;
  } else {
    User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        // user Found
        // salary or current
        B_Sheet.findOne({ user_id: userU._id }).then((userB) => {
          // balance sheet record not found
          if (!userB || userB == null) {
            return res
              .status(500)
              .send(
                `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT `
              );
          } else {
            // balance Sheet record found
            transaction
              .findOne({
                bank_id: userB._id,
              })
              .then((found) => {
                if (!found) {
                  res.send("No transaction found");
                } else {
                  // found transaction
                  console.log(found.Expense[0]);
                  //   res.send(found.Income[0].Date);

                  startDate = req.body.date_start;
                  var endDate = req.body.date_end;
                  var testDate;
                  for (let i = 0; i < found.Expense.length; i++) {
                    testDate = found.Expense[i].Date;
                    if (
                      moment(testDate, "DD-MM-YYYY").isBetween(
                        startDate,
                        endDate,
                        "DD-MM-YYYY"
                      )
                    ) {
                      console.log(
                        `Your Expense record found ${found.Expense[i]}`
                      );
                    }
                  }
                  for (let i = 0; i < found.Income.length; i++) {
                    testDate = found.Income[i].Date;
                    if (
                      moment(testDate, "DD-MM-YYYY").isBetween(
                        startDate,
                        endDate,
                        "DD-MM-YYYY"
                      )
                    ) {
                      console.log(
                        `Your Income record found ${found.Income[i]}`
                      );
                    }
                  }
                  res.send("Data Printed on console if found");
                }
              });
          }
        });
      }
    });
  }
};

exports.findtransaction = async function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.B_type == "" || req.body.B_type == undefined) {
    res.status(405).send("Balance Sheet type is mussing :: Enter again");
    return;
  } else if (req.body.T_category == "" || req.body.T_category == undefined) {
    res.status(405).send("Your Transaction category is missing ");
    return;
  } else if (
    req.body.T_category == "expense" ||
    req.body.T_category == "income"
  ) {
    // data avalidation complete for postman

    User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        // user Found
        // salary or current
        if (req.body.B_type == "salary") {
          B_Sheet.findOne({ user_id: userU._id, "salary.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT `
                  );
              } else {
                if (req.body.T_category == "expense") {
                  transaction
                    .findOne({
                      bank_id: userB._id,
                    })
                    .then((found) => {
                      if (!found) {
                        return res
                          .status(500)
                          .send(`Your desired category not found`);
                      } else {
                        console.log(found);
                        for (let i = 0; i < found.Expense.length; i++) {
                          console.log(
                            `Your Expense record found ${found.Expense[i]}`
                          );
                        }
                        res.send("Data printed on console");
                      }
                    });
                } else if (req.body.T_category == "income") {
                  transaction
                    .find({
                      bank_id: userB._id,
                    })
                    .then((found) => {
                      if (!found) {
                        return res
                          .status(500)
                          .send(`Your desired category not found`);
                      } else {
                        for (let i = 0; i < found.Income.length; i++) {
                          console.log(
                            `Your Income record found ${found.Income[i]}`
                          );
                        }
                        res.send("Data printed on console");
                      }
                      return res.send(found);
                    });
                }
              }
            }
          );
        } else if (req.body.B_type == "current") {
          B_Sheet.findOne({ user_id: userU._id, "current.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT `
                  );
              } else {
                if (req.body.T_category == "expense") {
                  transaction
                    .find({
                      bank_id: userB._id,
                    })
                    .then((found) => {
                      if (!found) {
                        return res
                          .status(500)
                          .send(`Your desired category not found`);
                      } else {
                        for (let i = 0; i < found.Income.length; i++) {
                          console.log(
                            `Your Income record found ${found.Income[i]}`
                          );
                        }
                        res.send("Data printed on console");
                      }
                    });
                } else if (req.body.T_category == "income") {
                  transaction
                    .find({
                      bank_id: userB._id,
                    })
                    .then((found) => {
                      if (!found) {
                        return res
                          .status(500)
                          .send(`Your desired category not found`);
                      } else {
                        return res.send(found.Income);
                      }
                    });
                }
              }
            }
          );
        }
      }
    });
  } else {
    res
      .status(405)
      .send(
        "Your Transaction category should be either 'expense' or 'income' (lowercase) "
      );
    return;
  }
};

exports.updatetransaction = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.B_type == "" || req.body.B_type == undefined) {
    res.status(405).send("Balance Sheet type is mussing :: Enter again");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(405).send("Category of transaction missing :: Enter again");
    return;
  } else if (req.body.amount == "" || req.body.amount == undefined) {
    res.status(405).send("Amount to be updated missing :: Enter again");
    return;
  } else if (
    req.body.T_type == "expense" ||
    req.body.T_type == "income" ||
    req.body.B_type == "salary" ||
    req.body.B_type == "current"
  ) {
    console.log(req.body);
    User.findOne({ Email: req.body.email }).then((userU) => {
      if (!userU || userU == null) {
        return res
          .status(500)
          .send("You are not our User... or Email is not registered.");
      } else {
        // user Found
        // salary or current
        if (req.body.B_type == "salary") {
          B_Sheet.findOne({ user_id: userU._id, "salary.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT `
                  );
              } else {
                // balance sheet found now checking for T category
                if (req.body.T_type == "expense") {
                  const up = transaction
                    .updateOne(
                      {
                        bank_id: userB._id,
                        "Expense.category": req.body.category,
                      },
                      {
                        $set: { "Expense.$.ammount": req.body.amount },
                      }
                    )
                    .then((found) => {
                      console.log(found);
                      userB.salary.balance += "Expense.$.ammount";
                      userB.salary.balance -= req.body.amount;
                      userB.save();
                      console.log(userB.salary.balance);
                      console.log("updated Expense amount value ");
                    })
                    .catch((err) => {
                      console.log(err);
                    });

                  return res.send(up);
                } else if (req.body.T_type == "income") {
                  const up = transaction
                    .updateOne(
                      {
                        bank_id: userB._id,
                        "Income.category": req.body.category,
                      },
                      {
                        $set: { "Income.$.ammount": req.body.amount },
                      }
                    )
                    .then((found) => {
                      console.log(found);
                      userB.salary.balance -= "Income.$.ammount";
                      userB.salary.balance += req.body.amount;
                      userB.save();
                      console.log(userB.salary.balance);
                      console.log("updated Income value ");
                    })
                    .catch((err) => {
                      console.log(err);
                    });

                  return res.send(up);
                }
              }
            }
          );
        } else if (req.body.B_type == "current") {
          B_Sheet.findOne({ user_id: userU._id, "current.type": true }).then(
            (userB) => {
              // balance sheet record not found
              if (!userB || userB == null) {
                return res
                  .status(500)
                  .send(
                    `YOUR BALANCE SHEET of ${req.body.B_type} type IS NOT PRESENT .`
                  );
              } else {
                // balance Sheet record found
                if (req.body.T_type == "expense") {
                  const up = transaction
                    .updateOne(
                      {
                        bank_id: userB._id,
                        "Expense.category": req.body.category,
                      },
                      {
                        $set: { "Expense.$.ammount": req.body.amount },
                      }
                    )
                    .then((found) => {
                      console.log(found);
                      userB.current.balance += "Expense.$.ammount";
                      userB.current.balance -= req.body.amount;
                      userB.save();
                      console.log(userB.salary.balance);
                      console.log("updated Expense amount value ");
                    })
                    .catch((err) => {
                      console.log(err);
                    });

                  return res.send(up);
                } else if (req.body.T_type == "income") {
                  const up = transaction
                    .updateOne(
                      {
                        bank_id: userB._id,
                        "Income.category": req.body.category,
                      },
                      {
                        $set: { "Income.$.ammount": req.body.amount },
                      }
                    )
                    .then((found) => {
                      console.log(found);
                      userB.current.balance -= "Income.$.ammount";
                      userB.current.balance += req.body.amount;
                      userB.save();
                      console.log(userB.salary.balance);
                      console.log("updated Income value ");
                    })
                    .catch((err) => {
                      console.log(err);
                    });

                  return res.send(up);
                }
              }
            }
          );
        }
      }
    });
  } else {
    res
      .status(405)
      .send(
        "Your Transaction category should be either 'expense' or 'income' (lowercase) or  Bank Account type be either 'salary or 'current' (lowercase)"
      );
    return;
  }
};

// new transaction according to new
exports.new_transaction = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.amount == "" || req.body.amount == undefined) {
    res.status(405).send("Amount of transaction missing :: Enter again");
    return;
  } else if (req.body.amount < 0 || req.body.amount > 9999999999) {
    res.status(405).send("Amount of transaction missing :: Enter again");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).send("CATEGORY MISSING:: Try again");
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res.status(400).send("dISCRIPTION mISSING:: Try again");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
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
          if (req.body.T_type == "expense") {
            BAccount.findOne(
              {
                _id: { $in: userU.BankAccount },
                accountName: req.body.accountname,
              },
              (err, docs) => {
                if (docs) {
                  const Trans = new transaction();
                  Trans.bank_id = docs._id;
                  Trans.T_Type = req.body.T_type;
                  Trans.ammount = req.body.amount;
                  Trans.Date = today.format("DD-MM-YYYY");
                  Trans.description = req.body.description;
                  Trans.category = req.body.category;
                  Trans.save().then((er, done) => {
                    if (er) {
                      console.log(er);
                    } else if (done);
                    {
                      console.log(done);
                    }
                  });
                  docs.Transaction.push(Trans);
                  docs.balance -= req.body.amount;
                  docs.save();
                  res.json({
                    message: `New Transaction ${req.body.T_type} Created Account created!`,
                  });
                } else if (!docs) {
                  res.send("No bank account with this name for transaction");
                }
              }
            );
            // check for salary
          } else if (req.body.T_type == "income") {
            BAccount.findOne(
              {
                _id: { $in: userU.BankAccount },
                accountName: req.body.accountname,
              },
              (err, docs) => {
                if (docs) {
                  const Trans = new transaction();
                  Trans.bank_id = docs._id;
                  Trans.T_Type = req.body.T_type;
                  Trans.ammount = req.body.amount;
                  Trans.Date = today.format("DD-MM-YYYY");
                  Trans.description = req.body.description;
                  Trans.category = req.body.category;
                  Trans.save().then((er, done) => {
                    if (er) {
                      console.log(er);
                    } else if (done);
                    {
                      console.log(done);
                    }
                  });
                  docs.Transaction.push(Trans);
                  docs.balance =
                    parseFloat(docs.balance) + parseFloat(req.body.amount);
                  docs.save();
                  res.json({
                    message: `New Transaction ${req.body.T_type} Created Account created!`,
                  });
                }
                if (err) {
                  res.json({ err: "Bank Record not found for transaction" });
                  console.log(err);
                }
              }
            );
          }
        }
      }
    });
  } else {
    res
      .status(400)
      .send("Transaction Type should be 'income' or 'expense' lowercase ");
    return;
  }
};

exports.find_all_transaction_by_type = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
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
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found

                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    T_Type: req.body.T_type,
                  },
                  (err, find) => {
                    if (find) {
                      res.send(`Your transactions by type are: ${find}`);
                    } else {
                      res.send(`No Transaction Found `);
                    }
                  }
                );
              } else {
                res.send("No record found");
              }
            }
          );
        }
      }
    });
  } else {
    res
      .status(400)
      .send("Transaction Type should be 'income' or 'expense' lowercase ");
    return;
  }
};

exports.find_all_transaction_by_category = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).send("Transaction category missing ::: Try Again ");
    return;
  } else {
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
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    category: req.body.category,
                  },
                  (err, find) => {
                    if (find) {
                      res.send(`Your transaction by category are ${find}`);
                    } else {
                      res.send(`No Transaction Found `);
                    }
                  }
                );
              } else {
                res.send("No record found");
              }
            }
          );
        }
      }
    });
  }
};

exports.Update_transaction = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).send("Transaction category missing ::: Try Again ");
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res.status(400).send("Transaction description missing ::: Try Again ");
    return;
  } else if (req.body.amount == "" || req.body.amount == undefined) {
    res.status(400).send("Transaction amount missing ::: Try Again ");
    return;
  } else if (req.body.T_id == "" || req.body.T_id == undefined) {
    res.status(400).send("Transaction category missing ::: Try Again ");
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
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
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.findOneAndUpdate(
                  {
                    _id: req.body.T_id,
                  },
                  {
                    description: req.body.description,
                    category: req.body.category,
                  },
                  (err, find) => {
                    if (find) {
                      if (find.T_Type == "income") {
                        docs.balance -= parseFloat(find.ammount); // making it neutral
                        console.log("Done Income neutral");
                      } else if (find.T_Type == "expense") {
                        docs.balance += parseFloat(find.ammount); // making it neutral
                        console.log("Done expense neutral");
                      }

                      if (req.body.T_type == "income") {
                        find.ammount = parseFloat(req.body.amount);
                        docs.balance += parseFloat(req.body.amount);
                        find.T_Type = req.body.T_type;

                        docs.save();
                        find.save();
                        res.send(" Transaction updated :: Hurray");
                      } else if (req.body.T_type == "expense") {
                        find.ammount = parseFloat(req.body.amount);
                        docs.balance -= parseFloat(req.body.amount);
                        find.T_Type = req.body.T_type;

                        docs.save();
                        find.save();
                        res.send(" Transaction updated :: Hurray");
                      }
                    }
                  }
                );
              } else {
                res.send("No Bank record found");
              }
            }
          );
        }
      }
    });
  } else {
    res.send("Transaction should be either 'income' or 'expense' (lowercase)");
  }
};

exports.find_transaction_by_date = function (req, res) {
  if (req.body.email == "" || req.body.email == undefined) {
    res.status(404).send("Missing Email: Enter Again");
    return;
  } else if (Evalid.validateEmailAddress(req.body.email) === -1) {
    res.status(405).send("Incorrect email :: Enter again");
    return;
  } else if (req.body.date_start == "" || req.body.date_start == undefined) {
    res.status(405).send("Start date is mussing :: Enter again");
    return;
  } else if (req.body.date_end == "" || req.body.date_end == undefined) {
    res.status(405).send("End date missing :: Enter again");
    return;
  } else if (moment(req.body.date_start, "DD-MM-YYYY").isValid() == false) {
    res.status(405).send("Start date format should be DD-MM-YYYY");
    return;
  } else if (moment(req.body.date_end, "DD-MM-YYYY").isValid() == false) {
    res.status(405).send("End date format should be DD-MM-YY");
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).send("Account name missing ::: Try Again ");
    return;
  } else {
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
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: req.body.accountname,
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                  },
                  (err, find) => {
                    if (find) {
                      var test, start, end;
                      test = moment(new Date(find[0].Date)).format(
                        "DD-MM-YYYY"
                      );
                      start = moment(new Date(req.body.date_start)).format(
                        "DD-MM-YYYY"
                      );
                      end = moment(new Date(req.body.date_end)).format(
                        "DD-MM-YYYY"
                      );

                      console.log(
                        moment(test).isBetween(start, end, "[]")
                      );

                      console.log(find.length);
                      console.log(find[0].Date);
                      console.log(req.body.date_start);
                      console.log(req.body.date_end);

                      for (var i = 0; i < find.length; i++) {
                        if (
                          moment(find[i].Date).isBetween(
                            start,
                            end
                          )
                        ) {
                          console.log(
                            `Your transaction records between these dates are : ${find[i]}`
                          );
                        }
                      }
                    }
                  }
                );
              } else {
                res.send("No record found");
              }
            }
          );
        }
      }
    });
  }
};
