const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  songName: {
    type: String,
    required: true
  },
  anime: {
    english: String,
    romaji: String,
    native: String,
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