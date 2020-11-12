const DatabaseAccess = require('../database/');
const http = require('http');
const {ChannelStatus} = require('../util.js');

// VIDEO DOWNSTREAM RESPONSES

function handleVideoByUsernamePOST(req, res){
    // Get the username
    let username = req.params.id;
    // Check if the username is not null
    if (username != null) {
        // Process the username
        username = username.substring(0, username.indexOf(".m3u8"));
        // Find the user
        DatabaseAccess.find.channelByUsername(username)
            .then((channel) => {
                if (channel === {} || channel === null) {
                    // Render the channel not found page
                    res.status(404).json({message: "Stream not found"});
                    return;
                }
                // Render the channel page
                requestPlaylist(req, channel.streamKey)
                    .then((playlist) => {
                        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                        res.setHeader('Content-Length', playlist.length);
                        console.info(playlist);
                        res.status(200).send(playlist);
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(404).json({message: "Not Online"});
                    });
            })
            .catch(err => {
                res.status(500).json({message: "A Internal Server Error happened. Oops..."});
            })
    } else {
        res.status(500).json({message: "A Internal Server Error happened. Oops..."});
    }
}

function handleVideoSetChannelOnlinePOST(req, res){
    let online = ChannelStatus.OFFLINE;
    if (req.body.online === true){
        online = ChannelStatus.ONLINE;
    }
    DatabaseAccess.write.setChannelStatusByKey(req.body.streamKey, online)
        .then((success) => {
            res.status(200).json({message: "Ok"});
        })
        .catch((err) => {
            res.status(500).json({message: "A Internal Server Error happened. Oops..."});
        })
}

/**
 * @param {Request} req
 * @param {string} streamKey
 * @return {Promise<Object>}
 */
let requestPlaylist = function (req, streamKey) {
    return new Promise((resolve, reject) => {
        let path = "/live/" + streamKey + "/index.m3u8";

        let options = {
            hostname: 'open-360-ingest-server',
            port: 8000,
            path: path,
            method: 'GET',
        }

        let request = http.request(options, res => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                console.info(body)
                let regex = /^.*(index)/mg;
                // WARN THIS CANNOT BE THE STREAM KEY IT'S NOT SAFE
                let videoStreamPath = req.protocol + '://' + req.get('host') + ":8000" + "/live/" + streamKey + "/index";
                console.info(videoStreamPath);
                body = body.replace(regex, videoStreamPath);
                console.info(body);
                resolve(body);
            });
        });

        request.on('error',err => {
            console.log("Could not connect to the web server");
            reject(err);
        });

        request.end();
    });
}

module.exports = {
    handleVideoByUsernamePOST: handleVideoByUsernamePOST,
    handleVideoSetChannelOnlinePOST: handleVideoSetChannelOnlinePOST
}