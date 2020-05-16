const express = require('express');
const router = express.Router();
const Song = require('../models/song');
const Progress = require('../models/progress');
const User = require('../models/user');

// based on offset
// get 50 progress based on provided username
// if no username is provided just query for all progress
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    if (req.query.username && !user) {
      return res.send([]);
    }
    const progress = await Progress
      .find(user ? { userId: user._id } : {})
      .limit(50)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .populate('songId');
    return res.send({ progress });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
})

// get one
router.get('/id', (req, res) => {

})

// add one
router.post('/upsertSong', async (req, res) => {

})

// update one
// router.

// delete one

module.exports = router