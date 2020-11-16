const DatabaseAccess = require("../database/");
const {ChannelStatus} = require("../util.js");

function handleCheckKeyExists(socket, data){
    let StreamKey = data.package.streamKey;
    DatabaseAccess.find.channelStreamKeyExists(StreamKey)
        .then((exists) => {
            socket.emit("api-message", {target: data.ack, ack: "web-api", type: "message", package: {prompt: "checkKeyExists-reply", result: exists, message: "Ok"}});
        })
        .catch((err) => {
            console.error(err);
            socket.emit("api-message", {target: data.ack, ack: "web-api", type: "message", package: {prompt: "checkKeyExists-reply", result: false, message: "Internal Server Error happened. Oops..."}});
        })
}

function handleSetChannelOnline(socket, data) {
    let online = ChannelStatus.OFFLINE;
    if (data.package.online === true){
        online = ChannelStatus.ONLINE;
    }
    let StreamKey = data.package.streamKey;
    DatabaseAccess.write.setChannelStatusByKey(StreamKey, online)
        .then((success) => {
            let message = StreamKey + " has come " + (online == ChannelStatus.ONLINE ? "online" : "offline");
            socket.emit("log",{log:message, type:"log"});
        })
        .catch((err) => {
            let message = err;
            socket.emit("log",{log:message, type:"error"});
        })
}

module.exports = {
    handleCheckKeyExists,
    handleSetChannelOnline
}