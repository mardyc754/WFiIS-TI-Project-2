const mongodb = require('mongodb');
const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");

const bodyParser= require('body-parser');
const pug = require('pug');

const app = express();
app.set('trustproxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let db;
const dbname = 'MDDatabase';
const url = 'mongodb+srv://MDdbuser:MDdbpassword@cluster0.8dpx2.mongodb.net/MDDatabase?retryWrites=true&w=majority';
  

app.use(session({
    secret: 'nothingspecialishere',
    resave: true,
    saveUninitialized: true,
    userId: '',
    sessionType: 'offline',
    cookie: { maxAge: 2000000 },
}));


app.get('/style.css', function(req,res) {
    res.sendFile(__dirname + '/style.css');
})

app.get('/js/fetch.js', function(req,res) {
    res.sendFile(__dirname + '/js/fetch.js');
})

app.get('/js/offline.js', function(req,res) {
    res.sendFile(__dirname + '/js/offline.js');
})

app.get('/js/analysys.js', function(req,res) {
    res.sendFile(__dirname + '/js/analysys.js');
})

app.get('/', function(req,res) {
    const result = pug.compileFile('templates/index.pug');
    res.status(200).send(result({sessionType: req.session.sessionType}));
})

app.get('/login', function(req,res) {
    const result = pug.renderFile('templates/login.pug');
    res.status(200).send(result);
})


app.get('/register', function(req,res) {
    const result = pug.renderFile('templates/register.pug');
    res.status(200).send(result);
})

app.get('/survey', function(req,res) {
    const result = pug.compileFile('templates/survey.pug');
    const params = {sessionType: req.session.sessionType, subsite: 'survey'};
    res.status(200).send(result(params));
})

app.get('/results', function(req,res) {
    let sessionType = req.session.sessionType;
    if(!sessionType) { sessionType = 'offline'; }
    const result = pug.compileFile('templates/results.pug');
    res.status(200).send(result({sessionType: sessionType, 
                            subsite: 'results'}));
})

app.post('/results/data', async function(req,res) {
    if(req.session.sessionType === "online"){
        const result = await db.collection('surveyResults').find({}).toArray();
        res.status(200).send(result);
    }
    else{
        res.send([]);
    }
})

app.post('/results/user', async function(req,res) {
    if(req.session.sessionType === "online"){
        const result = await db.collection('surveyResults').find({user: req.session.userId}).toArray();
        res.status(200).send(result);
    }
    else{
        res.send([]);
    }
});

app.get('/logout', function(req,res) {
    req.session.sessionType = 'offline';
    req.session.userId = '';
    req.session.destroy();
    //sessionStorage.removeItem('userId');
    result = pug.renderFile('templates/logout.pug');
    res.status(200).send(result);
});

app.post('/login', function(req,res) {
    if (!req.body.username || !req.body.password) {
        res.status(401).send({message: "Należy wypełnić wszystkie wymagane pola"});
    } else{
        mongodb.MongoClient.connect(url, function(err, client) {
            if (err) return console.log(err)
            db = client.db(dbname);
            console.log('Connect OK');
            let session = req.session;
            
            let cursor = db.collection('user').findOne({username: req.body.username}, function(err, dbResults) {
                if (err) 
                   return console.log(err);
    
                if(dbResults){
                   if(req.body.password === dbResults.password){
                      session.sessionType = 'online';
                      session.userId = dbResults._id;
                      res.status(200).send(req.body);
                   }else{
                      session.userId = '';
                      session.sessionType = 'offline';
                      res.status(401).send({error: "Niepoprawna nazwa uzytkownika lub hasło"});
                   }
                }else{
                    res.status(401).send({error: "Podany użytkownik nie znajduje się w bazie"});
                   session.sessionType = 'offline';
                }
             })
        });

      }
})

app.post('/register', function(req,res) {
    if (!req.body.username || !req.body.password || !req.body.passwordAgain) {
      res.status(401).send({error: "Należy wypełnić puste pola"});
    }else if(req.body.password != req.body.passwordAgain){
        res.status(401).send({error: "Hasła muszą się zgadzać"});
    }else{ 
      // connect to server database
      mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
        if (err) 
            return console.log(err)
 
        db = client.db(dbname);
        console.log('Connect OK');
        var session = req.session;
        
         var cursor = db.collection('user').findOne({username: req.body.username}, function(err, dbResults) {
            if (err) 
               return console.log(err);
            if(dbResults){
               res.status(409).send({error: "Podany użytkownik już istnieje"});
               session.userId = '';
               session.sessionType = 'offline';
            }else{
                let dataToInsert = {username: req.body.username, password: req.body.password};
                db.collection('user').insertOne(dataToInsert, function(err,result) {
                   if (err) return console.log(err);
                })
               res.status(201).send({message: "Pomyślnie założono konto!"});
            } 
         })
       });
      }
 })

app.post('/survey', async function(req,res) {
    let userId = req.session.userId;
    
    if(req.session.sessionType === 'online'){
        req.body.user = userId;

        db.collection('surveyResults').insertOne(req.body, (err, result) =>{
            if (err) return console.log(err)
            res.end('{"inserted record":"'+ result.insertedCount +'"}')
            })
            res.status(200).send(req.body);
    }
    else{
        res.status(401).send("Zaloguj się aby przesłać wyniki.");
    }
})


module.exports = app;
