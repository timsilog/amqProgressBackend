const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { searchAnilist } = require('../support/anilist');
const mongoose = require('mongoose');
const Song = require('../models/song');
const Progress = require('../models/progress');
const User = require('../models/user');

// GET progress based on provided method
// if no method is provided just query for all progress (up to limit)
/* QUERY
  method?: string   // method to query by (username, songname, animeEng, animeRom)
  username?: string // amq username (expects full name)
  songname?: string // songname (expects full name)
  animeEng?: string // anime name in english (expects full name)
  animeRom?: string // anime name in romaji (expects full name)
  offset?: string   // where to start query
  limit?: string    // how many to return (defaults to 500)
 */
router.get('/', async (req, res) => {
  try {
    const match = {};
    const method = req.query.method ? req.query.method : null;
    if (method === 'username') {
      if (!req.query.username) {
        res.status(400).send({ error: `No username provided for "method: username"` });
      }
      const user = await User.findOne({ username: req.query.username.toLowerCase() });
      if (req.query.username && !user) {
        return res.send([]);
      }
      match = {
        'userId': user._id
      }
    } else if (method === 'songname' || method === 'animeEng' || method === 'animeRom') {
      let song;
      if (method === 'songname') {
        if (!req.query.songname) {
          res.status(400).send({ error: `No songname provided for "method: songname"` });
        }
        song = await Song.findOne({ songname: req.query.songname });
      } else if (method === 'animeEng') {
        if (!req.query.animeEng) {
          res.status(400).send({ error: `No animeEng provide for "method: animeEng"` });
        }
        song = await Song.findOne({ 'anime.english': req.query.animeEng });
      } else if (method === 'animeRom') {
        if (!req.query.animeRom) {
          res.status(400).send({ error: `No animeRom provide for "method: animeRom"` });
        }
        song = await Song.findOne({ 'anime.romaji': req.query.animeRom });
      }
      if (!song) {
        return res.send([]);
      }
      match = {
        'songId': song._id
      }
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 500;
    const progress = await Progress.aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: "songs",
          localField: "songId",
          foreignField: "_id",
          as: "song"
        }
      },
      {
        $facet: {
          paginatedResults: [
            { $limit: req.query.offset ? parseInt(req.query.offset) + limit : limit },
            { $skip: req.query.offset ? parseInt(req.query.offset) : 0 }
          ],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ])
    return res.send({ progress: progress[0] });

    // OLD WAY WITH POPULATE (less efficient than aggregate, but less code)
    // const progress = await Progress
    //   .find(user ? { userId: user._id } : {})
    //   .limit(500)
    //   .skip(req.query.offset ? parseInt(req.query.offset) : 0)
    //   .populate('songId');
    // return res.send({ progress });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
})

// Upsert a progress
// Also upserts User and Song (not restful? but required for this application)
// See version in app.js that upserts user and song (not restful?)
/* BODY
  username: string,
  anime: string,
  isCorrect: boolean,
  songName: string,
  songType: string,
  songLink: string,
  songArtist: string,
  guess: string
*/
router.post('/upsert', async (req, res) => {
  try {
    // Get song
    const song = await getSong(req);
    // Get user
    let user = await User.findOne({ username: req.body.username.toLowerCase() });
    if (!user) {
      user = new User({ username: req.body.username.toLowerCase(), displayName: req.body.username })
      user.save();
    }
    // Upsert progress
    let progress = await Progress.findOne({ userId: mongoose.Types.ObjectId(user._id), songId: mongoose.Types.ObjectId(song._id) });
    const guessHash = crypto.createHash('sha1').update(`${req.body.guess}`).digest('hex');
    if (!progress) {
      progress = new Progress({
        lastSeen: new Date(),
        userId: user._id,
        songId: song._id,
        hits: req.body.isCorrect ? 1 : 0,
        misses: req.body.isCorrect ? 0 : 1,
        correctGuesses: req.body.isCorrect
          ? {
            [guessHash]: {
              guess: req.body.guess,
              count: 1
            }
          }
          : {},
        incorrectGuesses: req.body.isCorrect
          ? {}
          : {
            [guessHash]: {
              guess: req.body.guess,
              count: 1
            }
          }
      });
    } else {
      progress.lastSeen = new Date();
      if (req.body.isCorrect) {
        progress.hits++;
        const current = progress.correctGuesses.get(guessHash);
        if (!current) {
          progress.correctGuesses.set(guessHash, {
            guess: req.body.guess,
            count: 1
          });
        } else {
          progress.correctGuesses.set(guessHash, {
            guess: current.guess,
            count: current.count + 1
          });
        }
      } else {
        progress.misses++;
        const current = progress.incorrectGuesses.get(guessHash);
        if (!current) {
          progress.incorrectGuesses.set(guessHash, {
            guess: req.body.guess,
            count: 1
          });
        } else {
          progress.incorrectGuesses.set(guessHash, {
            guess: current.guess,
            count: current.count + 1
          });
        }
      }
    }
    progress.save();
    res.send({
      user,
      progress,
      song
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
})

const getSong = async (req) => {
  const uid = crypto.createHash('sha1').update(`${req.body.songName}${req.body.songArtist}${req.body.songType}`).digest('hex');
  // get song, insert if not found
  let song = await Song.findOne({ uid: uid });
  if (!song) {
    // couldn't find song, search for it on anilist
    titles = await searchAnilist(req.body.anime);
    const newSong = new Song({
      uid,
      songName: req.body.songName,
      anime: {
        english: titles.english,
        romaji: titles.romaji,
        native: titles.native,
        amq1: req.body.anime
      },
      songArtist: req.body.songArtist,
      songType: req.body.songType,
      songLink: [req.body.songLink]
    });
    try {
      song = await newSong.save();
    } catch (e) {
      if (e.code === 11000) {
        // there was a duplicate
        console.log('-----------TRYING AGAIN-------------')
        return getSong(req);
      } else {
        throw e;
      }
    }
  } else {
    let updated = false;
    // check for 2nd amq anime title (english or romaji)
    if (song.anime.amq1 !== req.body.anime && !song.anime.amq2) {
      song.anime.amq2 = req.body.anime;
      updated = true;
    }
    // add songlink if new
    if (!song.songLink.includes(req.body.songLink)) {
      if (song.songLink.includes('.webm')) {
        song.songLink = [req.body.songLink, ...song.songLink]
      } else {
        song.songLink.push(req.body.songLink);
      }
      updated = true;
    }
    if (updated) {
      song = await song.save();
    }
  }
  return song;
}

module.exports = router
