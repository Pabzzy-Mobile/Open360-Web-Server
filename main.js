// General Utility modules
const path = require('path');
// For the HTTP server
const express = require("express");
const app = express();
const http = require('http').createServer(app);
// Import the Nunjucks package
const nunjucks = require("nunjucks");

// For user login and persistence
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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
let { DatabaseAccess, Tests, Util, HTTPResponses, API} = require("./core/");

// Tell the server what port it should use. 4000 is for testing purposes
const PORT = parseInt(process.env.PORT) || 4000;
const BIND_ADDRESS = process.env.BIND_ADDRESS || "0.0.0.0";

// SET UP

passport.use('local', new LocalStrategy(
    function (username, password, cb) {
       // Find the user's Auth information
       DatabaseAccess.find.userAuthByUsername(username)
           .then(userData => {
              if (userData == null) {
                 return cb(null, false, {
                    message: "Username was not found"
                 });
              }

              let cryptography = Util.saltPassword(password, userData.salt);

              if (userData.password !== cryptography.password) {
                 return cb(null, false, {
                    message: "Password is incorrect"
                 });
              }

              let user = { userId: userData.userId, username: userData.username, displayName: userData.displayName };

              return cb(null, user);
            })
            .catch(err => {
               return cb(err, false, {
                  message: "There wan an error in the operation"
               });
            });
    })
);

passport.serializeUser(function (user, cb) {
   cb(null, user.userId);
});

passport.deserializeUser(function (id, cb) {
   DatabaseAccess.find.userDetailsByUserId(id)
       .then(userData => {
          let user = { userId: userData.userId, username: userData.username, displayName: userData.displayName };
          cb(null, user);
       })
       .catch(err => {
          return cb(err);
       })
});

// Set nunjucks as the render engine
nunjucks.configure('views', {
   autoescape: true,
   express: app
});
app.set('view engine', 'html');

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
   extended: false
}));
// Set up the parser for requests that are json type
app.use(require('body-parser').json('application/json'));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Use the public directory for files
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---- end of SET UP ----

// RESPONSES AND REQUESTS

// Home page request
app.get('/', function (req, res){
   HTTPResponses.home.handleHomepageGET(req, res);
});

// Profile page requests
app.get('/:id', function (req, res){
   HTTPResponses.channel.handleChannelByUsernameGET(req, res);
});

// LOGIN PAGES

app.get('/auth/login', function (req, res) {
   HTTPResponses.auth.handleAuthLoginGET(req, res);
});

app.post('/auth/login',
    passport.authenticate('local', {
       failureRedirect: '/auth/login',
       successRedirect: '/'
    })
);

app.get('/auth/register', function (req, res) {
   HTTPResponses.auth.handleAuthRegisterGET(req, res);
});

app.post('/auth/register', function (req, res) {
   HTTPResponses.auth.handleAuthRegisterPOST(req, res);
});

app.get('/auth/logout', function (req, res) {
   HTTPResponses.auth.handleAuthLogoutGET(req, res);
});

//app.post('/auth/skc', function (req, res) {
//    HTTPResponses.auth.handleStreamKeyCheckPOST(req, res);
//})

app.post('/auth/nsk', Util.IsLoggedIn, function (req, res) {
    HTTPResponses.auth.handleNewStreamKeyPOST(req, res);
})

// DASHBOARD AND SETTINGS REQUESTS

app.get('/user/dashboard', Util.IsLoggedIn, function (req, res) {
    HTTPResponses.dashboard.handleDashboardGET(req, res);
});

app.post('/user/dashboard', Util.IsLoggedIn, function (req, res) {
    HTTPResponses.dashboard.handleDashboardPOST(req, res);
});

// ALGORITHM REQUESTS

app.get('/algo/channels/featured', function (req, res){
   HTTPResponses.algo.handleAlgoChannelsFeaturedGET(req, res);
});

app.get('/algo/users/id/:id', function (req, res){
    HTTPResponses.algo.handleAlgoUserByIdGET(req, res);
});

// VIDEO REQUESTS

app.get('/video/:id', function (req, res) {
    HTTPResponses.video.handleVideoByUsernamePOST(req, res);
});

//app.post('/video/skso', function (req, res) {
//    HTTPResponses.video.handleVideoSetChannelOnlinePOST(req, res);
//});

// DEBUG REQUESTS

app.get('/debug/runTests', function (req, res) {
   Tests.run();
});

// ---- end of RESPONSES AND REQUESTS ----

// SERVER LISTEN

http.listen(PORT, BIND_ADDRESS,function (){
   console.info("Express listening on *:" + PORT);
});

// CONNECT TO THE INTERNAL API

// Socket for connecting to the internal API
const io = require("socket.io-client");

const socket = io("ws://open-360-api-sock:4000", {
    reconnectionDelayMax: 10000,
    query: {
        name: "open360:web-api-server"
    }
});

socket.on("connect", function (){
    console.log("Connected to Internal API");
    socket.emit("log",{log:"Connected to Internal API", type:"info"});
});

socket.on("web-api", (data) => {
    if (data.type == "question"){
        switch (data.package.prompt){
            case "checkKeyExists":
                API.channel.handleCheckKeyExists(socket, data);
                break;
            case "status":
                socket.emit("api-message", {target: data.ack, ack: "web-api",type: "message", package: {prompt: "status-reply", status: "alive"}});
                break;
        }
    }
    if (data.type == "message"){
        switch (data.package.prompt){
            case "setOnline":
                API.channel.handleSetChannelOnline(socket, data);
                break;
        }
    }
});

// ------ END OF INTERNAL API RESPONSES

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
