const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  pw: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  displayName: {
    type: String
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Account', accountSchema);