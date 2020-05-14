const options = require('./options.json');
const MongoClient = require('mongodb').MongoClient;
const uri = options.mongoUri;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(client)
let db;


// client.connect(err => {
//   const collection = client.db("test").collection("songs");
//   // perform actions on the collection object
//   console.log(collection);
//   client.close();
// });


// client.connect().then((err, db) => {
//   console.log(err);
//   console.log(db);
// })

client.connect(async (err, database) => {
  // console.log(err);
  // console.log(database);
  db = database.db('test');
  // const check = await db.collection('songs').findOne({ songName: "asd" });
  const insertion = await db.collection('songs').insertOne({
    songName: 'test1',
    anime: 'test2',
    songType: 'test3',
    songLink: 'test4'
  });
  console.log(insertion);
})

// console.log("asd");