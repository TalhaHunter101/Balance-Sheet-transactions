const express = require("express");
const router = express.Router();
const F_token = require("../Schema/F_Pass_token");
const User = require("../Schema/user");

router.post("", (req, res) => {
  console.log(req.body);
  const { password, c_password, Token } = req.body;

  if (!password || !c_password || !Token) {
    return res.status(300).json({ msg: "Please enter all fields" });
  } else if (password != c_password) {
    return res.status(360).json({ msg: "Password Mismatched:: Enter again" });
  } else if (Token.length != 4) {
    return res
      .status(360)
      .json({ msg: "Token SHould be 4 numbers:: Enter again" });
  } else if (password.length < 6 || c_password.length < 6) {
    return res
      .status(360)
      .json({ msg: "passward length should be 8 char minimum:: Enter again" });
  } else {
    // yaha per haie ab ham
    F_token.findOne({ Token })
      .then((userT) => {
        console.log(userT);
        if (userT === null || !userT) {
          res.send("Token is incorrect::: Enter Again");
        } else {
          User.findByIdAndUpdate(
            userT.Owner_id,
            { password: c_password },
            (err, docx) => {
              if (err) {
                console.log(err);
              } else {
                res.send("Password Changed.....");
                F_token.findByIdAndDelete(userT._id, (err, docs) => {
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
});

module.exports = router;
