var express = require("express");
const transaction = require("../Schema/transactionScehema");
const B_Sheet = require("../Schema/balanceSheetSchema");
const User = require("../Schema/User_schema");
const Evalid = require("../email_validator");
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
                  .findOne({
                    bank_id: userB._id,
                    "Expense.category": req.body.category,
                  })
                  .then((found) => {
                    if (!found) {
                      transaction
                        .findOne({
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
                  .findOne({
                    bank_id: userB._id,
                    "Expense.category": req.body.category,
                  })
                  .then((found) => {
                    if (!found) {
                      transaction
                        .findOne({
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
                  res.sound("No transaction found");
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
