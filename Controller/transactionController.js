var express = require("express");
const transaction = require("../Schema/transactionScehema");
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
// new transaction according to new
exports.new_transaction = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.amount == "" || req.body.amount == undefined) {
    res
      .status(400)
      .json({ Message: "Amount of transaction missing :: Enter again" });
    return;
  } else if (req.body.amount < 0 || req.body.amount > 9999999999) {
    res
      .status(400)
      .json({ Message: "Amount of transaction missing :: Enter again" });
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res.status(400).json({ Message: "CATEGORY MISSING:: Try again" });
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res.status(400).json({ Message: "DISCRIPTION MISSING:: Try again" });
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (req.body.t_type == "income" || req.body.t_type == "expense") {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User. or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == null || userU.BankAccount == " ") {
          res.status(404).json({ Message: "You dont have any bank Account  " });
          return;
        } else {
          // salary or current
          if (req.body.t_type == "expense") {
            BAccount.findOne(
              {
                _id: { $in: userU.BankAccount },
                accountName: { $regex: new RegExp(req.body.accountname, "i") },
              },
              (err, docs) => {
                if (docs) {
                  const Trans = new transaction();
                  Trans.bank_id = docs._id;
                  Trans.T_Type = req.body.t_type;
                  Trans.ammount = req.body.amount;
                  Trans.Date = today.format("DD-MM-YYYY");
                  Trans.description = req.body.description;
                  Trans.category = req.body.category;
                  Trans.save().then((er, done) => {
                    if (er) {
                      console.log(er);
                    }
                  });
                  docs.Transaction.push(Trans);
                  docs.balance -= req.body.amount;
                  docs.save();
                  res.status(200).json({
                    message: `New ${req.body.t_type} Transaction created!`,
                  });
                } else if (!docs) {
                  res.status(404).json({
                    Message: "No bank account with this name for transaction",
                  });
                }
              }
            );
            // check for salary
          } else if (req.body.t_type == "income") {
            BAccount.findOne(
              {
                _id: { $in: userU.BankAccount },
                accountName: { $regex: new RegExp(req.body.accountname, "i") },
              },
              (err, docs) => {
                if (docs) {
                  const Trans = new transaction();
                  Trans.bank_id = docs._id;
                  Trans.T_Type = req.body.t_type;
                  Trans.ammount = req.body.amount;
                  Trans.Date = today.format("DD-MM-YYYY");
                  Trans.description = req.body.description;
                  Trans.category = req.body.category;
                  Trans.save().then((er, done) => {
                    if (er) {
                      console.log(er);
                    }
                  });
                  docs.Transaction.push(Trans);
                  docs.balance =
                    parseFloat(docs.balance) + parseFloat(req.body.amount);
                  docs.save();
                  res.status(200).json({
                    message: `New ${req.body.t_type} Transaction Created `,
                  });
                } else {
                  res.status(404).json({
                    Message:
                      "No Bank Account regiseterd for your provided name:::",
                  });
                }
              }
            );
          }
        }
      }
    });
  } else {
    res.status(400).json({
      Message: "Transaction Type should be 'income' or 'expense' lowercase ",
    });
    return;
  }
};

exports.find_all_transaction_by_type = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (req.body.t_type == "income" || req.body.t_type == "expense") {
    // remember to chancge capital T on postman
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User... or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == "") {
          res.status(404).json({ Message: "You dont have any bank Account " });
          return;
        } else {
          // salary or current
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    T_Type: { $regex: new RegExp(req.body.t_type, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your transactions by type are:`,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: `No Transaction Found ` });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        }
      }
    });
  } else {
    res.status(400).json({
      Message: "Transaction Type should be 'income' or 'expense' lowercase ",
    });
    return;
  }
};

exports.find_all_transaction_by_category = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction category missing ::: Try Again " });
    return;
  } else {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User... or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == "") {
          res.status(400).json({ Message: "You dont have any bank Account  " });
          return;
        } else {
          // salary or current
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your transaction by category are :`,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: `No Transaction Found ` });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No record found" });
              }
            }
          );
        }
      }
    });
  }
};

exports.Update_transaction = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction category missing ::: Try Again " });
    return;
  } else if (req.body.description == "" || req.body.description == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction description missing ::: Try Again " });
    return;
  } else if (req.body.amount == "" || req.body.amount == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction amount missing ::: Try Again " });
    return;
  } else if (req.body.T_id == "" || req.body.T_id == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction category missing ::: Try Again " });
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User... or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == "") {
          res.status(404).json({ Message: "You dont have any bank Account " });
          return;
        } else {
          // salary or current
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
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
                        //console.log("Done Income neutral");
                      } else if (find.T_Type == "expense") {
                        docs.balance += parseFloat(find.ammount); // making it neutral
                        // console.log("Done expense neutral");
                      }

                      if (req.body.T_type == "income") {
                        find.ammount = parseFloat(req.body.amount);
                        docs.balance += parseFloat(req.body.amount);
                        find.T_Type = req.body.T_type;

                        docs.save();
                        find.save();
                        res.status(200).send(" Transaction updated :: Hurray");
                      } else if (req.body.T_type == "expense") {
                        find.ammount = parseFloat(req.body.amount);
                        docs.balance -= parseFloat(req.body.amount);
                        find.T_Type = req.body.T_type;

                        docs.save();
                        find.save();
                        res.status(200).send(" Transaction updated :: Hurray");
                      }
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No Bank record found" });
              }
            }
          );
        }
      }
    });
  } else {
    res.status(400).json({
      Message: "Transaction should be either 'income' or 'expense' (lowercase)",
    });
  }
};

exports.find_transaction_by_date = function (req, res) {
  const useremail = req.user.emil;
  if (req.body.date_start == "" || req.body.date_start == undefined) {
    res.status(400).json({ Message: "Start date is mussing :: Enter again" });
    return;
  } else if (req.body.date_end == "" || req.body.date_end == undefined) {
    res.status(400).json({ Message: "End date missing :: Enter again" });
    return;
  } else if (moment(req.body.date_start, "DD-MM-YYYY").isValid() == false) {
    res.status(400).json({ Message: "Start date format should be DD-MM-YYYY" });
    return;
  } else if (moment(req.body.date_end, "DD-MM-YYYY").isValid() == false) {
    res.status(400).json({ Message: "End date format should be DD-MM-YY" });
    return;
  } else if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User... or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == null) {
          res.status(404).json({ Message: "You dont have any bank Account " });
          return;
        } else {
          // salary or current
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    Date: {
                      $gte: req.body.date_start,
                      $lte: req.body.date_end,
                    },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your records are :`,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        }
      }
    });
  }
};

exports.Delete_tansaction = function (req, res) {
  const useremail = req.user.emil;

  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (req.body.T_type == "" || req.body.T_type == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction type missing ::: Try Again " });
    return;
  } else if (req.body.category == "" || req.body.category == undefined) {
    res
      .status(400)
      .json({ Message: "Transaction category missing ::: Try Again " });
    return;
  } else if (req.body.T_type == "income" || req.body.T_type == "expense") {
    User.findOne({ Email: useremail }).then((userU) => {
      if (!userU || userU == null) {
        return res.status(404).json({
          Message: "You are not our User... or Email is not registered.",
        });
      } else {
        if (userU.BankAccount == "") {
          res.status(404).json({ Message: "You dont have any bank Account " });
          return;
        } else {
          // salary or current
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              if (docs) {
                transaction.findOneAndDelete(
                  {
                    _id: { $in: docs.Transaction },
                    T_Type: { $regex: new RegExp(req.body.T_type, "i") },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find) {
                      if (find.T_Type == "income") {
                        docs.balance -= parseFloat(find.ammount); // making it neutral
                        // console.log("Done Income neutral");
                      } else if (find.T_Type == "expense") {
                        docs.balance += parseFloat(find.ammount); // making it neutral
                        //  console.log("Done expense neutral");
                      }
                      docs.Transaction.pull(find._id);
                      docs.save();
                      res.status(200).json({ Message: "Transaction Deleted" });
                    } else {
                      res
                        .status(404)
                        .json({ Message: `No Transaction Found ` });
                    }
                  }
                );
              } else {
                res.status(404).json({
                  Message: "No bank account of this name account Found ",
                });
              }
            }
          );
        }
      }
    });
  } else {
    return res.status(400).json({
      Message:
        "The Transaction should be either 'income or 'expense' (lowercase)'",
    });
  }
};

exports.find_transaction_filter_all = async (req, res) => {
  const useremail = req.user.emil;

  if (req.body.accountname == "" || req.body.accountname == undefined) {
    res.status(400).json({ Message: "Account name missing ::: Try Again " });
    return;
  } else if (
    (req.body.date_start && !req.body.date_end) ||
    (!req.body.date_start && req.body.date_end)
  ) {
    res
      .status(400)
      .json({ Message: "Both start and and dates should be provided" });
    return;
  }
  if (req.body.date_start && req.body.date_end) {
    if (
      (moment(req.body.date_start, "DD-MM-YYYY").isValid() == false &&
        moment(req.body.date_end, "DD-MM-YYYY").isValid() == true) ||
      (moment(req.body.date_start, "DD-MM-YYYY").isValid() == true &&
        moment(req.body.date_end, "DD-MM-YYYY").isValid() == false) ||
      (moment(req.body.date_start, "DD-MM-YYYY").isValid() == false &&
        moment(req.body.date_end, "DD-MM-YYYY").isValid() == false)
    ) {
      res.status(400).json({
        Message: "Both start and and dates should beformated as DD-MM-YYYY",
      });
      return;
    }
  }

  User.findOne({ Email: useremail }).then((userU) => {
    if (!userU || userU == null) {
      return res.status(404).json({
        Message: "You are not our User... or Email is not registered.",
      });
    } else {
      if (userU.BankAccount == null) {
        res.status(404).json({ Message: "You don't have any bank Account " });
        return;
      } else {
        if (
          req.body.date_start &&
          req.body.date_end &&
          req.body.T_type &&
          req.body.category
        ) {
          //console.log("I am date with category and type");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    Date: {
                      $gte: req.body.date_start,
                      $lte: req.body.date_end,
                    },
                    T_Type: { $regex: new RegExp(req.body.T_type, "i") },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your records are : `,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No Transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No Bank record found" });
              }
            }
          );
        } else if (
          req.body.date_start &&
          req.body.date_end &&
          req.body.T_type &&
          !req.body.category
        ) {
          // by dates
          // console.log("I am date with type only ");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    Date: {
                      $gte: req.body.date_start,
                      $lte: req.body.date_end,
                    },
                    T_Type: { $regex: new RegExp(req.body.T_type, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your records are :`,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No Transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          req.body.date_start &&
          req.body.date_end &&
          req.body.category &&
          !req.body.T_type
        ) {
          // by dates
          // console.log("I am date with category only");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    Date: {
                      $gte: req.body.date_start,
                      $lte: req.body.date_end,
                    },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res
                        .status(200)
                        .json({ Message: `Your records are : `, Data: find });
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No Transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          req.body.date_start &&
          req.body.date_end &&
          !req.body.category &&
          !req.body.T_type
        ) {
          // by dates
          //console.log("I am date only ");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    Date: {
                      $gte: req.body.date_start,
                      $lte: req.body.date_end,
                    },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your records are : `,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: "No Transaction record found" });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          // only category
          req.body.category &&
          !req.body.T_type &&
          !req.body.date_start &&
          !req.body.date_end
        ) {
          // console.log("i am category only");
          // category only
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your transaction by category are :`,
                        Data: find,
                      });
                    } else {
                      res.status(404).send(`No Transaction Found `);
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          // category and type
          req.body.category &&
          req.body.T_type &&
          !req.body.date_start &&
          !req.body.date_end &&
          (req.body.T_type == "income" || req.body.T_type == "expense")
        ) {
          // console.log("I am category with type");
          // category only
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                transaction.find(
                  {
                    _id: { $in: docs.Transaction },
                    T_Type: { $regex: new RegExp(req.body.T_type, "i") },
                    category: { $regex: new RegExp(req.body.category, "i") },
                  },
                  (err, find) => {
                    if (find && find != "") {
                      return res.status(200).json({
                        Message: `Your transaction by category and type are `,
                        Data: find,
                      });
                    } else {
                      res
                        .status(404)
                        .json({ Message: `No Transaction Found ` });
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          !req.body.T_type &&
          !req.body.category &&
          !req.body.date_start &&
          !req.body.date_end &&
          req.body.accountname
        ) {
          //console.log("I am accountname only");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
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
                    if (find && find != "") {
                      res.status(200).json({
                        Message: `Your transactions by accountname are:`,
                        Data: find,
                      });
                    } else {
                      res.status(404).send(`No Transaction Found `);
                    }
                  }
                );
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        } else if (
          // only type
          req.body.T_type != "" &&
          !req.body.category &&
          req.body.T_type != undefined &&
          !req.body.date_start &&
          !req.body.date_end &&
          (req.body.T_type == "income" || req.body.T_type == "expense")
        ) {
          //console.log("I am type only");
          BAccount.findOne(
            {
              _id: { $in: userU.BankAccount },
              accountName: { $regex: new RegExp(req.body.accountname, "i") },
            },
            (err, docs) => {
              // bank account found
              if (docs) {
                // bank account found
                if (
                  req.body.T_type == "income" ||
                  req.body.T_type == "expense"
                ) {
                  transaction.find(
                    {
                      _id: { $in: docs.Transaction },
                      T_Type: { $regex: new RegExp(req.body.T_type, "i") },
                    },
                    (err, find) => {
                      if (find && find != "") {
                        res.status(200).json({
                          Message: `Your transactions by type are: `,
                          Data: find,
                        });
                      } else {
                        res
                          .status(404)
                          .json({ Message: "No bank record found" });
                      }
                    }
                  );
                } else {
                  res.status(400).json({
                    Message:
                      "Transaction should be either 'income' or 'expense' (lowercase)",
                  });
                }
              } else {
                res.status(404).json({ Message: "No bank record found" });
              }
            }
          );
        }
      }
    }
  });
};
