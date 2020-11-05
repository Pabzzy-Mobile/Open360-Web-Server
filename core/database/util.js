// Require the other util module
const {generateString} = require("../util.js");
// Require other database files
const {userAuthExists, channelStreamKeyExists} = require("./find.js");
//let write = require("./write.js");
//let raw = require("./database");

// ----------------------- * Utility Methods * -----------------------

/**
 * Generates a unique userId
 * @return {string}
 */
function generateUserId () {
    let userId = generateString(32);
    userAuthExists(userId)
        .then(exists => {
            if (exists) userId = generateUserId();
        });
    return userId;
}

function generateStreamKey(){
    let streamKey = generateString(32);
    channelStreamKeyExists(streamKey)
        .then(exists => {
            if (exists) streamKey = generateUserId();
        });
    return streamKey;
}

module.exports = {
    generateUserId,
    generateStreamKey
}
