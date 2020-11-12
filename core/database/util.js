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
    return new Promise((resolve, reject) => {
        let userId = generateString(32);
        userAuthExists(userId)
            .then(exists => {
                if (exists) {
                    generateUserId()
                        .then(newUserId => {
                            userId = newUserId;
                        });
                } else {
                    resolve (userId);
                }
            })
            .catch(err => {
                reject(err);
            })
    });
}

function generateStreamKey(){
    return new Promise((resolve, reject) => {
        let streamKey = generateString(32);
        channelStreamKeyExists(streamKey)
            .then(exists => {
                if (exists) {
                    generateStreamKey()
                        .then(newStreamKey => {
                            streamKey = newStreamKey;
                        });
                } else {
                    resolve(streamKey);
                }
            })
            .catch(err => {
                reject(err);
            })
    });
}

module.exports = {
    generateUserId,
    generateStreamKey
}
