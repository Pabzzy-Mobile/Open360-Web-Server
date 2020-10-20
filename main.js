// General Utility modules
const path = require('path');
// For the HTTP server
const express = require("express");
const app = express();
const http = require('http').createServer(app);

// Encryption of passwords
const crypto = require('crypto');
// Encryption and store of sessions
const redis = require('redis');
const session = require('express-session');
const RedisStore = require("connect-redis")(session);
let RedisClient = redis.createClient({
   host: 'open360-redis-session',
   port: 6379
});

// Require our core library
let { DatabaseAccess, Tests} = require("./core");

// Tell the server what port it should use. 4000 is for testing purposes
const PORT = parseInt(process.env.PORT) || 4000;

// SET UP

// Set up the middleware for storing sessions and session tokens
const sessionMiddleware = session({
   secret: "keyboard birb",
   resave: false,
   saveUninitialized: false,
   store: new RedisStore({
      client: RedisClient,
      prefix: "sess:"
   })
});
app.use(sessionMiddleware)

// Set up the parser for requests that are urlencoded (for data in GET requests)
app.use(require('body-parser').urlencoded({
   extended: true
}));

// Use the public directory for files
app.use('/', express.static(path.join(__dirname, 'public')));

// RESPONSES AND REQUESTS

// Home page request
app.get('/', function (req, res){
   res.send("Hello World!");
});

// Profile page requests
app.get('/profile', function (req, res){
   if (req.query.u != null) {
      // Find the user
      DatabaseAccess.find.userByUsername(req.body.u, function (user) {
         if (user === {} || user === null) {
            res.send("User not found");
            return;
         }
         // Send info back
         res.send(req.query.u + " corresponded with " + (JSON.stringify(user) || null));
      });
   } else {
      res.send('Search for a user using /profile?u=&lt;username&gt;\nThe current query is ' + JSON.stringify(req.query));
   }
});

// RUN SERVER TESTS BEFORE STARTING
Tests.run();

// SERVER LISTEN

http.listen(PORT, function (){
   console.info("Express listening on *:" + PORT);
});

// ERROR HANDLING

RedisClient.on('error', function (e){
   if (e.code === 'ECONNREFUSED') {
      console.error("Redis could not connect to the local database, error bellow");
      console.error(e);
      process.exit(404);
      return;
   }
   console.error(e);
});
