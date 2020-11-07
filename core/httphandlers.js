const {UserData, UserDataTypes, ChannelData, ChannelStatus, NotAllowedUsernames, saltPassword, IsEmail} = require("./util.js");
const DatabaseAccess = require("./database/");

// Define this object's info
const moduleInfo = {};
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
    // Temporary Bugfix
    if (username == "favicon.ico") {
        res.status(404).json({message: "what are you requesting????"})
        return;
    }
    // Check if the username is not null
    if (username != null) {
        // Find the user
        DatabaseAccess.find.channelByUsername(username)
            .then(channel => {
                if (channel === {} || channel === null) {
                    // Render the channel not found page
                    res.render("channel_not_found", {
                        user: req.user,
                        channel: false,
                        req: JSON.stringify(req.user),
                        data: JSON.stringify(channel) || null,
                        message: 'Search for a user using /username\nThe current query is ' + JSON.stringify(username)
                    });
                    return;
                }
                // Render the channel page
                res.render("channel", {
                    user: req.user,
                    channel: channel,
                    req: JSON.stringify(req.user),
                    data: JSON.stringify(channel) || null,
                    message: null
                });
            })
            .catch(err => {
                // Render the channel not found page
                res.render("channel_not_found", {
                    user: req.user,
                    channel: false,
                    req: JSON.stringify(req.user),
                    data: null,
                    message: err
                });
            })
    } else {
        // Render the channel page
        res.render("channel", {
            user: req.user,
            channel: false,
            req: JSON.stringify(req.user),
            data: null,
            message: 'Search for a user using /&lt;username&gt;\nThe current query is ' + JSON.stringify(username)
        });
    }
}

// ALGORITHM RESPONSES

function handleAlgoChannelsFeaturedGET(req, res){
    let data = {};
    // TODO
    //  Cache data from these methods
    DatabaseAccess.find.algoChannelsCurrentOnline()
        .then((results) => {
            data.channels = results;
            // Send the data back
            res.status(200).json(data);
        })
        .catch(err => {
            console.error(err);
            data.error = err.name;
            res.status(500).json(data);
        });
}

function handleAlgoUserByIdGET(req, res) {
    let data = {};
    // Get the userId
    let userId = req.params.id;
    DatabaseAccess.find.userDetailsByUserId(userId)
        .then((result) => {
            if (result == null){
                // Send 404 user not found
                res.status(404).json({message: "not found"});
            } else {
                data.userId = result.userId;
                data.username = result.username;
                data.displayName = result.displayName;
                // Send the data back
                res.status(200).json(data);
            }
        })
        .catch(err => {
            console.error(err);
            data.error = err.name;
            res.status(500).json(data);
        });
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
        failureRedirect: '/auth/login',
        successRedirect: '/'
    });
}

function handleAuthRegisterPOST(req, res){
    let cryptography = saltPassword(req.body.password);
    // Cast POST data to userData
    let userData = new UserData();
    userData.userId = DatabaseAccess.util.generateUserId();
    userData.username = req.body.username;
    userData.displayName = req.body.username;
    userData.email = req.body.email;
    userData.password = cryptography.password;
    userData.salt = cryptography.salt;
    userData.subscriptions = [];
    userData.active = true;
    userData.type = UserDataTypes.ALL_INFO;
    // Create channel data
    let channelData = new ChannelData();
    channelData.channelStatus = ChannelStatus.OFFLINE;
    channelData.streamKey = DatabaseAccess.util.generateStreamKey();
    channelData.userId = userData.userId;
    channelData.username = userData.username;
    channelData.title = "Stream Title";
    channelData.description = "Stream Description";
    channelData.directory = "universal";

    if (NotAllowedUsernames.includes(userData.username)){
        res.render('register',{
            error: "This username is not allowed"
        });
        return;
    }
    if (!IsEmail(userData.email)) {
        res.render('register',{
            error: "Insert a valid email"
        });
        return;
    }
    // Check if the user already is taken
    DatabaseAccess.find.userAuthExistsByUserData(userData)
        .then(message => {
            if (message !== "ok") {
                res.render('register',{
                    error: message
                });
                return;
            }
            let promises = [
                // Add the user to the database
                DatabaseAccess.write.addUserAllInfo(userData),
                // Add the user's channel to the database
                DatabaseAccess.write.addChannel(channelData)
            ]
            Promise.all(promises)
                .then(data => {
                    res.redirect('/auth/login');
                })
                .catch(err => {
                    console.log(err);
                    res.render('register',{
                        error: "An Internal error happened. Oops..."
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.render('register',{
                error: "An Internal error happened. Oops..."
            });
        })
}

module.exports = {
    moduleInfo,
    handleHomepageGET,
    handleChannelByUsernameGET,
    handleAlgoChannelsFeaturedGET,
    handleAuthLoginGET,
    handleAuthRegisterGET,
    handleAuthLogoutGET,
    handleAuthLoginPOST,
    handleAuthRegisterPOST,
    handleAlgoUserByIdGET
}