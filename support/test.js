require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const fs = require('fs');
const Song = require('../models/song');
const Progress = require('../models/progress');
const User = require('../models/user');
const { findDupeSongs, viewDupes, removeDupes } = require('./findDupes');

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
  const songs = await Song.find();
  for (const song of songs) {
    if (song.songArtist) {
      console.log(song);
    }
  }
  // return await findDupeSongs();
  // return await viewDupes();
  // return await removeDupes();
}

main().then(res => {
  fs.writeFile('output.json', JSON.stringify(res), () => console.log('written'));
});