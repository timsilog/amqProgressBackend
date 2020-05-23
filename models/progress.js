const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  lastSeen: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  },
  hits: Number,
  misses: Number,
  correctGuesses: [String],
  incorrectGuesses: [String]
});

module.exports = mongoose.model('Progress', progressSchema);