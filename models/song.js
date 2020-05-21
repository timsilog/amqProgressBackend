const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  songName: {
    type: String,
    required: true
  },
  anime: {
    english: String,
    romaji: String,
    native: String,
    amq: String,
  },
  songType: {
    type: String,
    required: true
  },
  songLink: {
    type: [String],
    required: true
  }
})

module.exports = mongoose.model('Song', songSchema);