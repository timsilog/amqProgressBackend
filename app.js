require('dotenv').config()
const crypto = require('crypto');
const express = require('express');
const routes = express.Router();
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const songRouter = require('./routes/songRoute');
const progressRouter = require('./routes/progressRoute');
const { searchAnilist } = require('./support/anilist');
const Song = require('./models/song');
const User = require('./models/user');
const Progress = require('./models/progress');

mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
const db = mongoose.connection
db.on('error', (error) => console.error(`Db error: ${error}`));
db.once('open', () => console.log('Connected to Database'));

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/', routes);
app.use('/songs', songRouter);
app.use('/progress', progressRouter);

routes.route('/').get((req, res) => {
  res.send('hello world');
})

routes.route('/user').get(async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username })
    // const user = (await (await db.collection('users').find({ username: req.query.username })).toArray())[0];
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.message })
  }
})


/* body {
  username: string,
  anime: string,
  isCorrect: boolean,
  songName: string,
  songType: string,
  songLink: string,
  songArtist: string,
  guess: string
} */

const getSong = async (req) => {
  const uid = crypto.createHash('sha1').update(`${req.body.songName}${req.body.songArtist}${req.body.songType}`).digest('hex');
  // get song, insert if not found
  let song = await Song.findOne({ uid: uid });
  console.log(song);
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
        return getSong();
      } else {
        console.log(e.message);
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
      song.songLink.push(req.body.songLink);
      updated = true;
    }
    if (updated) {
      song = await song.save();
    }
  }
  return song;
}

routes.route('/updateProgress').post(async (req, res) => {
  try {
    // Get song
    const song = await getSong(req);
    // Get user
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      user = new User({ username: req.body.username })
      user.save();
    }
    // Upsert progress
    let progress = await Progress.findOne({ userId: mongoose.Types.ObjectId(user._id), songId: mongoose.Types.ObjectId(song._id) });
    if (!progress) {
      progress = new Progress({
        userId: user._id,
        songId: song._id,
        hits: req.body.isCorrect ? 1 : 0,
        misses: req.body.isCorrect ? 0 : 1,
        correctGuesses: req.body.isCorrect ? [req.body.guess] : [],
        incorrectGuesses: req.body.isCorrect ? [] : [req.body.guess]
      });
    } else {
      if (req.body.isCorrect) {
        progress.hits++;
        if (!progress.correctGuesses.includes(req.body.guess)) {
          progress.correctGuesses.push(req.body.guess);
        }
      } else {
        progress.misses++;
        if (!progress.incorrectGuesses.includes(req.body.guess)) {
          progress.incorrectGuesses.push(req.body.guess);
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
    console.log(err);
    res.status(500).send({ error: err.message });
  }
})

app.listen(process.env.PORT, () => {
  // console.log(`Listening on port: ${process.env.PORT}`)
})
