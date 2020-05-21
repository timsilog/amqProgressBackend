require('dotenv').config()
const fetch = require("node-fetch");
const readline = require('readline');
const mongoose = require('mongoose');
const Song = require('../models/song');

const searchAnilist = async (anime) => {
  // Here we define our query as a multi-line string
  // Storing it in a separate .graphql/.gql file is also possible
  var query = `
  query ($search: String) { # Define which variables will be used in the query (id)
    Media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
      title {
        romaji
        english
        native
      }
    }
  }
  `;

  // Define our query variables and values that will be used in the query request
  var variables = {
    search: anime
  };

  // Define the config we'll need for our Api request
  var url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };

  // Make the HTTP Api request
  try {
    console.log("attempting query")
    const response = await fetch(url, options);
    console.log("got result")
    const media = await response.json()
    return media.data.Media.title;
  } catch (err) {
    console.error(err);
  }
}

const updateSongAnime = async (searchTerm, updateId) => {
  mongoose.connect(process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
  const db = mongoose.connection
  db.on('error', (error) => console.error(`Db error: ${error}`));
  // db.once('open', () => console.log('Connected to Database'));
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const result = await searchAnilist(searchTerm);
  console.log(result);
  const song = await Song.findOne({ _id: updateId })
  console.log(song);
  rl.question('Continue? Y / N: ', async (res) => {
    if (res.toLowerCase() === 'y' || res.toLowerCase() === 'yes') {
      song.anime = result;
      console.log(song);
      try {
        await song.save();
        console.log('Successfully saved');
        return;
      } catch (e) {
        console.error(`Failed to save: ${e.message}`);
        return;
      }
    }
  });
}

module.exports = { searchAnilist, updateSongAnime };