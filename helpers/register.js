const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  // Name checks
  if (Validator.isEmpty(data.username)) {
    errors.username = " field is required";
  } else {
    /*
      4-20 alphanumeric chars with only '.' '-' or '_'
      Cannot start or end with any of the above special characters
      nor can any of the special chars repeat.
    */
    const userRegex = /^(?=[a-zA-Z0-9._-]{4,20}$)(?!.*[_.-]{2})[^_.-].*[^_.-]$/g;
    if (!userRegex.test(data.username)) {
      errors.username = " is invalid";
    }
  }
  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = " field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = " is invalid";
  }
  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = " field is required";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = " field is required";
  }
  if (!Validator.isLength(data.password, { min: 8, max: 30 })) {
    errors.password = " must be at least 8 characters";
  }
  // Must be 8-20 chars, contain at least 1: lowercase, uppercase, digit, special char
  const pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/g;
  if (!pwRegex.test(data.password)) {
    errors.password = " must be 8-20 characters and contain 1 lowercase letter, uppercase letter, digit, and special character";
  }
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = " - Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};