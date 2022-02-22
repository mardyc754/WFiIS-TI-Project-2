const mongodb = require('mongodb');
const express = require('express');

const bodyParser= require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let db;
const dbname = '9dychala';
const url = 'mongodb://'+dbname+':pass'+dbname+'@172.20.44.25/'+dbname;


mongodb.MongoClient.connect(url, function(err, client) {
  if (err) return console.log(err)
  db = client.db(dbname);
  console.log('Connect OK');
})  

app.get('/', function(req,res) {
    res.sendFile('index.html');
})



app.listen(20003, function() {
  console.log('listening on 20003')
})

