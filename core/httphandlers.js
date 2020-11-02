const Util = require("./util.js");
const DatabaseAccess = require("./database/");

// Define this object's info
let moduleInfo = {};
moduleInfo.name = "HTTP Handlers";
moduleInfo.description = "This module handles the HTTP GET and POST requests of Open360";

// HOME PAGES RESPONSES

function handleHomepageGET(req, res){
    res.render("index", {
        user: req.user,
        req: JSON.stringify(req.user)
    });
}

// CHANNEL PAGES RESPONSES

function handleChannelByUsernameGET(req, res){
    // Get the username
    let username = req.params.id;
    // Check if the username is not null
    if (username != null) {
        // Find the user
        DatabaseAccess.find.userByUsername(username, function (err, user) {
            if (user === {} || user === null || user.empty()) {
                // Render the channel page
                res.render("channel", {
                    user: req.user,
                    channel: false,
                    req: JSON.stringify(req.user),
                    data: JSON.stringify(user) || null,
                    message: 'Search for a user using /&lt;username&gt;\nThe current query is ' + JSON.stringify(username)
                });
                return;
            }
            // Render the channel page
            res.render("channel", {
                user: req.user,
                channel: user,
                req: JSON.stringify(req.user),
                data: JSON.stringify(user) || null,
                message: null
            });
            return;
        });
    } else {
        // Render the channel page
        res.render("channel", {
            user: req.user,
            channel: false,
            req: JSON.stringify(req.user),
            data: JSON.stringify(user) || null,
            message: 'Search for a user using /&lt;username&gt;\nThe current query is ' + JSON.stringify(username)
        });
        return;
    }
}

/*private*/ function sendaaa(){}

// ALGORITHM RESPONSES

function handleAlgorithmFeaturedChannelsGET(req, res){

}

// AUTHENTICATION RESPONSES

function handleAuthLoginGET(req, res){
    res.render('login');
}

function handleAuthRegisterGET(req, res){
    res.render('register');
}

function handleAuthLogoutGET(req, res){
    req.logout();
    res.redirect('/');
}

// DOESN'T WORK???
function handleAuthLoginPOST(req, res, passport){
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/'
    });
}

function handleAuthRegisterPOST(req, res){
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

    if (Util.NotAllowedUsernames.includes(userData.username)){
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
        // Add the user's channel to the database
        DatabaseAccess.write.addChannel(channelData, function (err){

        });
    });
}

module.exports = {
    handleHomepageGET,
    handleChannelByUsernameGET,
    handleAlgorithmFeaturedChannelsGET,
    handleAuthLoginGET,
    handleAuthRegisterGET,
    handleAuthLogoutGET,
    handleAuthLoginPOST,
    handleAuthRegisterPOST
}