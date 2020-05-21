const Song = require('../models/song');
const Progress = require('../models/progress');
const User = require('../models/user');
const fs = require('fs');
const mongoose = require('mongoose');


const findDupeSongs = async () => {
  return await Song.aggregate([
    {
      $group: {
        _id: {
          songName: "$songName", anime: '$anime.amq'
        },
        uniqueIds: { $addToSet: "$_id" },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { "$gt": 1 }
      }
    },
    {
      $sort: {
        count: -1
      }
    }
  ]);
}

const viewDupes = async () => {
  const dupes = JSON.parse(fs.readFileSync('./temp.json'));
  res = [];
  for (const dupe of dupes) {
    res.push(await Song.find({ songName: dupe._id.songName }))
    // for (const id of dupe.uniqueIds) {
    //   const song = await Song.findOne({ _id: mongoose.Types.ObjectId(id) })
    //   res.push(song);
    // }
  }
  return res;
}

const removeDupes = async () => {
  const dupes = JSON.parse(fs.readFileSync('./temp.json'));
  removed = [];
  removeMe = [];
  for (const dupe of dupes) {
    for (let i = 0; i < dupe.uniqueIds.length - 1; i++) {
      removeMe.push(mongoose.Types.ObjectId(dupe.uniqueIds[i]));
    }
  }
  return await Song.remove({ _id: { $in: removeMe } });
}

module.exports = { findDupeSongs, viewDupes, removeDupes };