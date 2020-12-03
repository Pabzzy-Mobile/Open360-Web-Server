const DatabaseAccess = require('../database/');
const {ChannelStatus} = require('open360-util');

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

        let promises = [
            DatabaseAccess.find.channelByUsername(username),
            DatabaseAccess.find.channelViewsByUsername(username)
        ]

        // Find the channel
        Promise.all(promises)
            .then((data) => {
                let channel = data[0];
                channel.views = data[1];
                if (channel === {} || channel === null) {
                    // Render the channel not found page
                    res.render("channel_not_found", {
                        user: req.user,
                        channel: false,
                        channelUsername: username,
                        online: false,
                        req: JSON.stringify(req.user),
                        data: JSON.stringify(channel) || null,
                        message: 'Search for a user using /username\nThe current query is ' + JSON.stringify(username)
                    });
                    return;
                }
                // WARN: Passing in the stream key is bad, consider database
                let videoStreamPath = req.protocol + '://' + req.get('host') + ":80" + "/video/" + channel.username + ".m3u8";
                // Render the channel page
                res.render("channel", {
                    user: req.user,
                    channel: channel,
                    channelUsername: username,
                    online: channel.channelStatus == ChannelStatus.ONLINE,
                    message: videoStreamPath
                });
            })
            .catch(err => {
                // Render the channel not found page
                res.render("channel_not_found", {
                    user: req.user,
                    channel: false,
                    channelUsername: username,
                    online: false,
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
            online: false,
            req: JSON.stringify(req.user),
            data: null,
            message: 'Search for a user using /&lt;username&gt;\nThe current query is ' + JSON.stringify(username)
        });
    }
}

module.exports = {
    handleChannelByUsernameGET
}