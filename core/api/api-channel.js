const DatabaseAccess = require("../database/");
const Util = require("open360-util");

function handleCheckKeyExists(socket, data){
    let StreamKey = data.package.streamKey;
    DatabaseAccess.find.channelStreamKeyExists(StreamKey)
        .then((exists) => {
            let pack = {
                prompt: "checkKeyExists-reply",
                data: {exists: exists},
                message: "Ok"
            }
            Util.api.sendMessage(socket, data.ack, "web-api", pack);
        })
        .catch((err) => {
            console.error(err);
            let pack = {
                prompt: "checkKeyExists-reply",
                data: {exists: false},
                message: "Internal Server Error happened. Oops..."
            }
            Util.api.sendMessage(socket, data.ack, "web-api", pack);
        });
}

function handleSetChannelOnline(socket, data) {
    let online = Util.ChannelStatus.OFFLINE;
    if (data.package.data.online === true){
        online = Util.ChannelStatus.ONLINE;
    }
    let StreamKey = data.package.data.streamKey;
    DatabaseAccess.write.setChannelStatusByKey(StreamKey, online)
        .then((success) => {
            let message = StreamKey + " has come " + (online == Util.ChannelStatus.ONLINE ? "online" : "offline");
            Util.api.sendLog(socket, message, Util.api.LogType.log);
        })
        .catch((err) => {
            let message = err;
            Util.api.sendLog(socket, message, Util.api.LogType.error);
        })
}

function handleStreamStatus(socket, data) {
    let username = data.package.data.username;
    DatabaseAccess.find.channelByUsername(username)
        .then((channelData) => {
            if (channelData == null) {
                let pack = {
                    prompt: "streamStatus-reply",
                    data: {name: "UNKNOWN", code: 3},
                    message: "Not Found"
                };
                Util.api.sendMessage(socket, data.ack, "web-api", pack);
                return;
            }
            let channelStatus = Util.ChannelStatus[channelData.channelStatus];
            let pack = {
                prompt: "streamStatus-reply",
                data: {
                    name: channelStatus,
                    code: channelData.channelStatus
                },
                message: "Ok"
            };
            Util.api.sendMessage(socket, data.ack, "web-api", pack);
        })
        .catch((err) => {
            let message = err.toString();
            Util.api.sendLog(socket, message, Util.api.LogType.error);
        });
}

function handleStreamStats(socket, data) {
    let username = data.package.data.username;
    DatabaseAccess.find.channelByUsername(username)
        .then((channelData) => {
            if (channelData == null) {
                let pack = {
                    prompt: "streamStats-reply",
                    data: {
                        streamTitle: "",
                        streamDescription: "",
                        streamTags: [],
                        streamDirectory: "",
                        channelOwner: "",
                        channelStatus: {name: "UNKNOWN", code: 3}
                        },
                    message: "Not Found"
                }
                Util.api.sendMessage(socket, data.ack, "web-api", pack);
                return;
            }
            let channelStatus = Util.ChannelStatus[channelData.channelStatus];
            let pack = {
                prompt: "streamStats-reply",
                data: {
                    streamTitle: channelData.title,
                    streamDescription: channelData.description,
                    streamTags: channelData.tags,
                    streamDirectory: channelData.directory,
                    channelOwner: channelData.username,
                    channelStatus: {
                        name: channelStatus,
                        code: channelData.channelStatus
                    }},
                message: "Ok"
            };
            Util.api.sendMessage(socket, data.ack, "web-api", pack);
        })
        .catch((err) => {
            let message = err.toString();
            Util.api.sendLog(socket, message, Util.api.LogType.error);
        });
}

function handleIncrementViewers(socket, data){
    let username = data.package.data.username;
    let amount = data.package.data.amount;
    let increment = data.package.data.increment;
    DatabaseAccess.write.incrementViewerShip(username, amount, increment)
        .then()
        .catch((err) => {
            let message = err.toString();
            Util.api.sendLog(socket, message, Util.api.LogType.error);
        });
}

function handleSetViewerCount(socket, data){
    let username = data.package.data.username;
    let count = data.package.data.count;
    DatabaseAccess.write.setViewerShip(username, count)
        .then()
        .catch((err) => {
            let message = err.toString();
            Util.api.sendLog(socket, message, Util.api.LogType.error);
        });
}

module.exports = {
    handleCheckKeyExists,
    handleSetChannelOnline,
    handleStreamStatus,
    handleStreamStats,
    handleIncrementViewers,
    handleSetViewerCount
}