const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.emailOrUsername = !isEmpty(data.emailOrUsername) ? data.emailOrUsername : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  // Email checks
  if (Validator.isEmpty(data.emailOrUsername)) {
    errors.emailOrUsername = "Email or Username field is required";
  } /*else if (!Validator.isEmail(data.emailOrUsername)) {
    errors.emailOrUsername = "Email is invalid";
  }*/

  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};