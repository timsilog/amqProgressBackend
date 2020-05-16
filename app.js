require('dotenv').config()
const express = require('express');
const routes = express.Router();
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const songRouter = require('./routes/songRoute');
const { searchAnilist } = require('./anilist');
const Song = require('./models/song');
const User = require('./models/user');
const Progress = require('./models/progress');

mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
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

routes.route('/').get((req, res) => {
  res.send('hello world');
})

routes.route('/user').get(async (req, res) => {
  try {
    const user = (await (await db.collection('users').find({ username: req.query.username })).toArray())[0];
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
  songLink: string
} */
routes.route('/updateProgress').post(async (req, res) => {
  try {
    console.log(db);
    // get song, insert if not found
    let song = await Song.findOne({
      $or: [
        { anime: { english: req.body.anime } },
        { anime: { romaji: req.body.anime } }
      ],
      songName: req.body.songName,
      songType: req.body.songType
    });
    console.log(song);
    if (!song) {
      // couldn't find song, search for it on anilist
      titles = await searchAnilist(req.body.anime);
      const newSong = new Song({
        songName: req.body.songName,
        anime: {
          english: titles.english,
          romaji: titles.romaji,
          native: titles.native
        },
        songType: req.body.songType,
        songLink: [req.body.songLink]
      });
      console.log(newSong);
      song = await newSong.save();
    }
    // add songlink if new
    if (!song.songLink.includes(req.body.songLink)) {
      song.songLink.push(req.body.songLink);
      song = song.save();
    }

    // update user progress
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      user = new User({ username: req.body.username })
      user.save();
    }
    console.log(user);
    let progress = await Progress.findOne({ userId: user._id, songId: song._id });
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
    res.status(500).send({ error: err.message });
  }
})

app.listen(process.env.PORT, () => {
  // console.log(`Listening on port: ${process.env.PORT}`)
})
