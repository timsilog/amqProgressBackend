// const { searchAnilist } = require('./anilist');
const Song = require('../models/song');

const searchSongs = async (song) => {
  const songs = await Song.find({ songName: song });
  console.log(songs);
}

const reorderAndRemoveDupeSongs = async () => {
  const songs = await Song.find();
  for (const song of songs) {
    let map = {};
    for (let i = 0; i < song.songLink.length; i++) {
      if (map[song.songLink[i]]) {
        song.songLink.splice(i, 1);
      } else {
        map[song.songLink[i]] = true;
      }
    }
    song.songLink.sort((a, b) => a.includes('.webm') && b.includes('.mp3') ? -1 : 1);
    await song.save();
    console.log(song);
    map = {};
  }
  console.log('done')
}

module.exports = { reorderAndRemoveDupeSongs };