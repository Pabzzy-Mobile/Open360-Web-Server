// Require the util module
const {UserData, UserDataTypes, ChannelData} = require("../util.js");
// Require other database files
//const util = require("./util.js");
//const write = require("./write.js");
const {retrieveDocOne, retrieveDocManyAll} = require("./database");

// ------------------------- * Find Methods * -------------------------

// ------------------------- User Related -------------------------

/**
 * @callback userFindCallback
 * @param {Error} err
 * @param {UserData} result
 */

/**
 * Find user details by userId
 * @param userId {string} - The userId to look for
 * @param callback {userFindCallback} - The callback function
 */
 function userDetailsByUserId (userId, callback){
    // Set the query
    let query = { userId: userId };
    // Execute the query
    retrieveDocOne("user_info", query, function (err, result){
        if (err != null) {
            callback(err, null);
            return;
        }
        // Create an empty UserData object
        let userData = new UserData();
        // Cast the result to UserData object
        userData = userData.cast(result);
        // Set the data type to user auth
        userData.type = UserDataTypes.JUST_DETAILS;
        // Pass the result to the callback function
        callback(null, userData);
    });
}

/**
 * Find user auth by userId
 * @param userId {string} - The userId to look for
 * @param callback {userFindCallback} - The callback function
 */
 function userAuthByUserId (userId, callback){
    // Set the query
    let query = { userId: userId };
    // Execute the query
    retrieveDocOne("user_auth", query, function (err, result){
        if (err != null) {
            callback(err, null);
            return;
        }
        // Create an empty UserData object
        let userData = new UserData();
        // Cast the result to UserData object
        userData = userData.cast(result);
        // Set the data type to user auth
        userData.type = UserDataTypes.JUST_AUTH;
        // Pass the result to the callback function
        callback(null, userData);
    });
}

/**
 * @callback userCheckCallback
 * @param {boolean} result of the query
 */

/**
 * Returns true if user ID already exists
 * @param userId {string|UserData}
 * @param [callback] {userCheckCallback}
 */
 function userAuthExists (userId, callback){
    if (typeof userId == "UserData") {
        userAuthExistsByUserData(userId, callback);
    }
    // Set the query
    let query = { userId: userId };
    // Execute the query
    retrieveDocOne("user_auth", query, function (err, result){
        if (err != null) {
            callback(err, null);
            return;
        }
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(result != null);
        // Return if the user was found
        return result != null;
    });
}

/**
 * @callback userdataCheckCallback
 * @param {boolean} result of the query
 * @param {string} message
 */

/**
 * Returns true if user ID already exists
 * @param userData {UserData}
 * @param callback {userdataCheckCallback}
 */
 function userAuthExistsByUserData (userData, callback){
    // Set the queries
    let filter = { $or:
            [
                {username: userData.username},
                {email: userData.email}
            ]
    };
    // Execute the queries
    retrieveDocManyAll("user_info", filter, function (err, result){
        if (err != null) {
            callback(false, "An error has occurred");
            return;
        }
        // Define the return message
        let message = "ok";
        // Go through each result and check if there is collisions
        result.forEach(function (userFound) {
            // Create an empty UserData object
            let foundUserData = new UserData();
            // Cast the result to UserData object
            foundUserData = foundUserData.cast(userFound);
            // Set the data type to user auth
            foundUserData.type = UserDataTypes.JUST_AUTH;
            // Check if the username is taken
            if (foundUserData.username === userData.username) message = "Username already taken";
            // Check if the email is taken
            if (foundUserData.email === userData.email) message = "Email already taken";
        });
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(result.length === 0, message);
        // Return if the user was found
        return result.length === 0;
    });
}

/**
 * Find user auth by username
 * @param username {string} - The username to look for
 * @param callback {userFindCallback} - The callback function
 */
 function userAuthByUsername (username, callback){
    // WARN: This function gets the userId from user_info and then uses that to get the user_auth. This is not good
    // Set the query for the user info
    let query = { username: username };
    // Execute the query
    retrieveDocOne("user_auth", query, function (err, result){
        // Check if the user was found
        if (result == null) {
            callback(null, null);
            return;
        }
        // Create an empty UserData object
        let userAuthData = new UserData();
        // Cast the result to UserData object
        userAuthData = userAuthData.cast(result);
        // Set the data type to user auth
        userAuthData.type = UserDataTypes.JUST_AUTH;
        // Pass the result to the callback function
        callback(null, userAuthData);
    });
}

/**
 * @callback userAuthGetActiveCallback
 * @param {Error} err
 * @param {boolean} active
 */

/**
 * Get the active state of the account
 * @param {string} userId
 * @param {userAuthGetActiveCallback} callback
 */
function userAuthGetActive (userId, callback){
    // Set the query for the user info
    let query = { userId: userId };
    // Execute the query
    retrieveDocOne("user_auth", query, function (err, result){
        // Check if the user was found
        if (result == null || err != null) {
            callback(new Error("User was not found"), null);
            return;
        }
        // Create an empty UserData object
        let userAuthData = new UserData();
        // Cast the result to UserData object
        userAuthData = userAuthData.cast(result);
        // Set the data type to user auth
        userAuthData.type = UserDataTypes.JUST_AUTH;
        // Pass the result to the callback function
        callback(null, userAuthData.active);
    });
}

/**
 * Retrieves the user's details by username
 * @param username {string} - The username to look for
 * @param callback {userFindCallback} - The callback function
 */
 function userByUsername (username, callback){
    // Set the query
    let query = { username: username };
    // Execute the query
    retrieveDocOne("user_info", query, function (err, result){
        // Check if the user was found
        if (result == null) {
            callback(null, null);
            return;
        }
        // Create an empty UserData object
        let userData = new UserData();
        // Cast the result to UserData object
        userData = userData.cast(result);
        // Set the data type to user auth
        userData.type = UserDataTypes.JUST_DETAILS;
        // Pass the result to the callback function
        callback(null, userData);
    });
}

// ------------------------- Channel Related -------------------------

/**
 * @callback findChannelCallback
 * @param {Error} err
 * @param {ChannelData} channelData
 */

/**
 * Retrieves the channel from the username given
 * This method is twice slower than find channel by userId
 * @param {string} username
 * @param {findChannelCallback} callback
 */
 function channelByUsername (username, callback){
    // Get the user
    userByUsername(username, function (err, result) {
        channelByUserId(result.userId, callback);
    });
}

/**
 * Retrieves the channel from the userId given
 * @param {string} userId
 * @param {findChannelCallback} callback
 */
 function channelByUserId (userId, callback){
    // Set the query
    let query = { userId: userId };
    retrieveDocOne("channel_info", query, function (err, result) {
        // Check if the user was found
        if (result == null) {
            callback(null, null);
            return;
        }
        // Create an empty UserData object
        let channelData = new ChannelData();
        // Cast the result to UserData object
        channelData = channelData.cast(result);
        // Pass the result to the callback function
        callback(null, channelData);
    });
}

module.exports = {
    userDetailsByUserId,
    userByUsername,
    userAuthByUsername,
    userAuthExistsByUserData,
    userAuthExists,
    userAuthByUserId,
    userAuthGetActive,
    channelByUserId,
    channelByUsername
}