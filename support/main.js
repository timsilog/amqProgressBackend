require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const fs = require('fs');
const Song = require('../models/song');
const Progress = require('../models/progress');
const User = require('../models/user');
const { updateSongAnime } = require('./anilist');
const { findDupeSongs, viewDupes, removeDupes } = require('./findDupes');
const { reorderAndRemoveDupeSongs } = require('./fixSong');

mongoose.connect(process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
const db = mongoose.connection
db.on('error', (error) => console.error(`Db error: ${error}`));
db.once('open', () => console.log('Connected to Database'));

const main = async () => {

  // update a song with the wrong anime
  // updateSongAnime(searchTerm, updateId);

  // sort and remove all dupe video and mp3 links
  // return reorderAndRemoveDupeSongs();
  const progresses = (await Progress.find());
  const res = [];
  for (const progress of progresses) {
    // let flag = false;
    // if (progress.correctGuesses) {
    //   progress.correctGuessesOld = progress.correctGuesses;
    //   delete progress.correctGuesses;
    //   flag = true;
    // }
    // if (progress.incorrectGuesses) {
    //   progress.incorrectGuessesOld = progress.incorrectGuesses;
    //   delete progress.incorrectGuesses;
    //   flag = true;
    // }
    // if (flag) {
    //   console.log(progress);
    progress.correctGuesses = {};
    progress.incorrectGuesses = {};
    console.log(progress);
    res.push(await progress.save());
    // }
  }
  return res;
  // return await findDupeSongs();
  // return await viewDupes();
  // return await removeDupes();
}

main().then(res => {
  fs.writeFile('output.json', JSON.stringify(res), () => console.log('written'));
});