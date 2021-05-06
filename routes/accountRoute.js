const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const keys = require("../../config/keys");
const validateRegisterInput = require("../helpers/register");
const validateLoginInput = require("../helpers/login");
const Account = require('../models/account');

router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Account.findOne({
    $or: [
      { email: req.body.email.toLowerCase() },
      { username: req.body.username.toLowerCase() }]
  }).then(account => {
    if (account) {
      if (account.email === req.body.email.toLowerCase()) {
        return res.status(400).json({ email: " already exists" });
      } else {
        return res.status(400).json({ username: " already exists" });
      }
    } else {
      const newAccount = new Account({
        displayName: req.body.username,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        pw: req.body.password
      });
      // Hash password before saving in database
      bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(newAccount.pw, salt, (err, hash) => {
          if (err) throw err;
          newAccount.pw = hash;
          newAccount
            .save()
            .then(account => res.json(account))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(401).json(errors);
  }
  // Find account by email
  Account.findOne({
    $or: [
      { email: req.body.emailOrUsername },
      { username: req.body.emailOrUsername.toLowerCase() }
    ]
  }).then(account => {
    // Check if account exists
    if (!account) {
      return res.status(404).json({ accountNotFound: " not found" });
    }
    // Check password
    bcrypt.compare(req.body.password, account.pw).then(isMatch => {
      if (isMatch) {
        // Account matched
        // Create JWT Payload
        const payload = {
          id: account._id,
          username: account.username
        };
        // Sign token
        jwt.sign(
          payload,
          process.env.PASSPORT_SECRET,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(401)
          .json({ passwordIncorrect: " incorrect" });
      }
    });
  });
});

module.exports = router;