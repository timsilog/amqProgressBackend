const fetch = require("node-fetch");

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
// function handleResponse(response) {
//   return response.json().then(function (json) {
//     return response.ok ? json : Promise.reject(json);
//   });
// }

// function handleData(data) {
//   console.log(data.data.Media.title);
//   return data.data.Media.title;
// }

// function handleError(error) {
// alert('Error, check console');
// console.error(error);
// }

module.exports = { searchAnilist };