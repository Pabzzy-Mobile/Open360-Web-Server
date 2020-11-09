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
    handleAuthLoginGET,
    handleAuthLoginPOST,
    handleAuthRegisterGET,
    handleAuthRegisterPOST,
    handleAuthLogoutGET
}