const DatabaseAccess = require('../database/');
const {Settings, SettingsType} = require('open360-util');

// DASHBOARD RESPONSES

function handleDashboardGET(req, res){
    let username = req.user.username;
    // Find the user
    DatabaseAccess.find.channelByUsername(username)
        .then((channel) => {
            channel.tags = [tagsToString(channel.tags)];
            // Render the channel not found page
            res.render("dashboard", {
                user: req.user,
                channel: channel,
                message: false
            });
        })
        .catch((err) => {
            // Render the channel not found page
            res.redirect("/auth/login");
        });
}

/**
 * Converts tags into "tag1,tag2,tag3"
 * @param {string[]} channelTagsArray
 * @return {string}
 */
function tagsToString (channelTagsArray){
    let str = "";
    channelTagsArray
        .forEach((tag) => {
            str += tag + ";"
        });
    return str.slice(0, -1);
}

function handleDashboardPOST(req, res){
    let newSettings = new Settings().cast(req.body);

    let displayName = newSettings.user.displayName

    if (displayName.length > 32) {
        newSettings.user.displayName = displayName.substr(0,32);
    }

    switch (newSettings.type) {
        case SettingsType.USER_DATA:
            DatabaseAccess.write.saveUserSettings(req.user.userId, newSettings)
                .then((success) => {
                    res.status(200).json({message: "User Settings Saved"});
                })
                .catch((err) => {
                    res.status(500).json({message: "A Internal server error has occurred. Oops...", err: err});
                });
            break;
        case SettingsType.CHANNEL_DATA:
            DatabaseAccess.write.saveChannelSettings(req.user.userId, newSettings)
                .then((success) => {
                    res.status(200).json({message: "Channel Settings Saved"})
                })
                .catch((err) => {
                    res.status(500).json({message: "A Internal server error has occurred. Oops...", err: err});
                });
            break;
        default:
            res.status(404).send("what are you even doing? Oops I guess?");
    }
}

module.exports = {
    handleDashboardGET,
    handleDashboardPOST
}