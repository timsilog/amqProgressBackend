const express = require('express');
const router = express.Router();
const User = require('../models/user');

// based on offset
// get 20 users at a time
// if no username is provided just query for all users
// searches based on regex
/* QUERY
  username?: string // amq username
  offset?: string   // where to start query
  limit?: string    // how many to return (defaults to 20)
 */
router.get('/', async (req, res) => {
  try {
    const users = await User
      .find(req.query.username ? { username: { $regex: req.query.username.toLowerCase() } } : {})
      .limit(req.query.limit ? req.query.limit : 20)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0);
    res.send({ users });
  } catch (err) {
    res.status(500).send({ error: err });
  }
})


/* BODY
  username: string        // amq username
  newUsername?: string
  newDisplayName?: string
 */
router.post('/update', async (req, res) => {
  if (!req.body.username) {
    res.status(400).send({ error: 'No username was provided' })
  }
  try {
    const user = await User.findOne({ username: req.body.username });
    if (req.body.newUsername) {
      user.username = req.body.newUsername;
    }
    if (req.body.newDisplayName) {
      user.displayName = req.body.newDisplayName;
    }
    await user.save();
    res.send({
      updatedUser: user
    });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
})


module.exports = router
