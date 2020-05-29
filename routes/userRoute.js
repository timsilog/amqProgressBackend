const express = require('express');
const router = express.Router();
const User = require('../models/user');

// based on offset
// get 20 users at a time
// if no songname is provided just query for all users
router.get('/', async (req, res) => {
  try {
    const users = await User
      .find(req.query.username ? { username: req.query.username.toLowerCase() } : {})
      .limit(20)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0);
    res.send({ users });
  } catch (err) {
    res.status(500).send({ error: err });
  }
})

module.exports = router
