const { searchAnilist, updateSongAnime } = require('anilist');
const Song = require('../models/song');

const searchSongs = async (song) => {
  const songs = await Song.find({ songName: song });
  console.log(songs);
}

updateSongAnime()