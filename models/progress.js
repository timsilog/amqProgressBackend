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
  correctGuesses: Map,
  incorrectGuesses: Map,
});

module.exports = mongoose.model('Progress', progressSchema);