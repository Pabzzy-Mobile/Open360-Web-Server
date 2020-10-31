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
let { DatabaseAccess, Tests, Util} = require("./core");

// Tell the server what port it should use. 4000 is for testing purposes
const PORT = parseInt(process.env.PORT) || 4000;

// SET UP

passport.use(new LocalStrategy(
    function (username, password, cb) {
       // Find the user's Auth information
       DatabaseAccess.find.userAuthByUsername(username, function (err, userData) {

          if (err) {
             // console.log("Failed to login");
             return cb(err, false, {
                message: "There wan an error in the operation"
             });
          }

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
       });
    })
);

passport.serializeUser(function (user, cb) {
   cb(null, user.userId);
});

passport.deserializeUser(function (id, cb) {
   DatabaseAccess.find.userDetails(id, function (err, userData) {
      if (err) {
         return cb(err);
      }

      let user = { userId: userData.userId, username: userData.username, displayName: userData.displayName };

      cb(null, user);
   });
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

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Use the public directory for files
app.use('/public', express.static(path.join(__dirname, 'public')));

// RESPONSES AND REQUESTS

// Home page request
app.get('/', function (req, res){
   res.render("index", {
      user: req.user,
      req: JSON.stringify(req.user)
   });
});

// Profile page requests
app.get('/:id', function (req, res){
   // Get the username
   let username = req.params.id;
   // Check if the username is not null
   if (username != null) {
      // Find the user
      DatabaseAccess.find.userByUsername(username, function (err, user) {
         if (user === {} || user === null || user.empty()) {
            res.send("User not found");
            return;
         }
         // Render the channel page
         res.render("channel", {
            user: req.user,
            channel: user,
            req: JSON.stringify(req.user),
            data: JSON.stringify(user) || null
         });
      });
   } else {
      res.send('Search for a user using /&lt;username&gt;\nThe current query is ' + JSON.stringify(username));
   }
});

// LOGIN PAGES

app.get('/auth/login', function (req, res) {
   res.render('login');
});

app.post('/auth/login',
    passport.authenticate('local', {
       failureRedirect: '/login',
       successRedirect: '/'
    })
);

app.get('/auth/register', function (req, res) {
   res.render('register');
});

app.post('/auth/register', function (req, res) {
   let cryptography = Util.saltPassword(req.body.password);
   // Cast POST data to userData
   let userData = new Util.UserData();
   userData.userId = DatabaseAccess.util.generateUserId();
   userData.username = req.body.username;
   userData.displayName = req.body.username;
   userData.email = req.body.email;
   userData.password = cryptography.password;
   userData.salt = cryptography.salt;
   userData.subscriptions = [];
   userData.active = true;
   userData.type = Util.UserDataTypes.ALL_INFO;

   if (Util.notAllowedUsernames.includes(userData.username)){
      res.render('register',{
         error: "This username is not allowed"
      });
   }
   // Check if the user already is taken
   DatabaseAccess.find.userAuthExistsByUserData(userData, function (userExists, message){
      if (message !== "ok") {
         res.render('register',{
            error: message
         });
         return;
      }
      // Add the user to the database
      DatabaseAccess.write.addUserAllInfo(userData, function (err) {
         if (err) {
            console.log(err);
            res.redirect('/auth/register');
         } else {
            res.redirect('/auth/login');
         }
      });
   });
});

app.get('/auth/logout', function (req, res) {
   req.logout();
   res.redirect('/');
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
