const DatabaseAccess = require('../database/');
const {UserData, UserDataTypes, saltPassword, ChannelStatus, ChannelData, NotAllowedUsernames, IsEmail} = require('../util.js');

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
    // Generate Id and Stream Key
    let generationPromises = [
        DatabaseAccess.util.generateUserId(),
        DatabaseAccess.util.generateStreamKey(),
    ]
    Promise.all(generationPromises)
        .then((data) => {
            // Cast POST data to userData
            let userData = new UserData();
            userData.userId = data[0];
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
            channelData.streamKey = data[1];
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
                        DatabaseAccess.write.addChannel(channelData),
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
                });
        });
}

function handleStreamKeyCheckPOST(req, res) {
    if (!req.body.streamKey){
        res.status(400).json({message: "No key provided for the check"});
    }
    let StreamKey = req.body.streamKey;
    DatabaseAccess.find.channelStreamKeyExists(StreamKey)
        .then((exists) => {
            res.status(200).json({result: exists, message: "Ok"});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Internal Server Error happened. Oops..."})
        })
}

function handleNewStreamKeyPOST(req, res){
    let userId = req.user.userId;
    DatabaseAccess.util.generateStreamKey()
        .then((newStreamKey) => {
            DatabaseAccess.write.setChannelStreamKey(userId, newStreamKey)
                .then((success) => {
                    res.status(200).json({streamKey: newStreamKey, message: "Ok"});
                })
                .catch((err) => {
                    res.status(500).json({message: "A Internal Server Error happened. Oops..."});
                });
        })
        .catch((err) => {
            res.status(500).json({message: "A Internal Server Error happened. Oops..."});
        })
}

module.exports = {
    handleAuthLoginGET,
    handleAuthLoginPOST,
    handleAuthRegisterGET,
    handleAuthRegisterPOST,
    handleAuthLogoutGET,
    handleStreamKeyCheckPOST,
    handleNewStreamKeyPOST
}