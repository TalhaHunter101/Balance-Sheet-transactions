const mongoose = require("mongoose");
const schma = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchma = new schma({
  Full_name: {
    type: String,
    required: [true, "Please add a firstname"],
  },
  Email: {
    type: String,
    required: [true, "Please add a firstname"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  Password: {
    type: String,
    required: [true, "Please add password"],
  },

  BankAccount: [
    {
      type: schma.Types.ObjectId,
      ref: "bAccount",
    },
  ],
});

// password hashing before saving bycrypt code
UserSchma.pre("save", function (next) {
  const user = this;

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      //by default salt
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.Password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          user.Password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});

module.exports = mongoose.model("User", UserSchma);
