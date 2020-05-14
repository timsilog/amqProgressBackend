const express = require('express');
const router = express.Router();
const Song = require('../models/song');


// get all
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find();
    res.send({ songs });
  } catch (err) {
    res.status(500).send({ error: err });
  }
})

// get one
router.get('/id', (req, res) => {

})

// add one
router.post('/upsertSong', async (req, res) => {



  // const song = new Songs({
  //   songName: req.body.songName,
  //   anime: [req.body.anime],
  //   songType: req.body.songType,
  //   songLink: [req.body.songLink]
  // })
  // try {
  //   const newSong = await song.save();
  //   res.status(201).send({ newSong });
  // } catch (err) {
  //   res.status(400).send({ message: err.message });
  // }
})

// update one
// router.

// delete one

module.exports = router
