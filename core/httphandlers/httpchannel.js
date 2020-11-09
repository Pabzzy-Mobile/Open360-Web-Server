const DatabaseAccess = require('../database/');

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

module.exports = {
    handleChannelByUsernameGET
}