// Require other database files
let find = require("./find.js");
let write = require("./write.js");
let raw = require("./database");

// ----------------------- * Utility Methods * -----------------------

/**
 * Generates a unique userId
 * @return {string}
 */
function generateUserId () {
    let userId = generateString(32);
    if (find.userAuthExists(userId)){
        userId = generateUserId();
    }
    return userId;
}

module.exports = {
    generateUserId
}
