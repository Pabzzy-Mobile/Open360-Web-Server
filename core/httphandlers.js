const Util = require("./util.js");
const DatabaseAccess = require("./database.js");

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
    });
}

module.exports = {
    handleHomepageGET,
    handleChannelByUsernameGET,
    handleAuthLoginGET,
    handleAuthRegisterGET,
    handleAuthLogoutGET,
    handleAuthLoginPOST,
    handleAuthRegisterPOST
}