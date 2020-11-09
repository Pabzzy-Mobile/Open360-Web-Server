// Require the util module
const {UserData, UserDataTypes, ChannelData, ChannelStatus} = require("../util.js");
// Require other database files
//const util = require("./util.js");
const {retrieveDocOne, retrieveDocManyAll, retrieveDocManyLimit} = require("./database.js");
//const write = require("./write.js");

// ------------------------- * Find Methods * -------------------------

// ------------------------- User Related -------------------------

/**
 * Find user details by userId
 * @param userId {string} - The userId to look for
 * @return {Promise<UserData>}
 */
function userDetailsByUserId (userId){
     return new Promise((resolve, reject) => {
         // Set the query
         let query = { userId: userId };
         // Execute the query
         retrieveDocOne("user_info", query)
             .then(result => {
                 // Check if the user was found
                 if (result == null) {
                     resolve(null);
                     return;
                 }
                 // Create an empty UserData object
                 let userData = new UserData();
                 // Cast the result to UserData object
                 userData = userData.cast(result);
                 // Set the data type to user auth
                 userData.type = UserDataTypes.JUST_DETAILS;
                 // Pass the result to the callback function
                 resolve( userData);
             })
             .catch(err => reject(err));
     });
}

/**
 * Find user auth by userId
 * @param userId {string} - The userId to look for
 * @return {Promise<UserData>}
 */
function userAuthByUserId (userId){
     return new Promise((resolve, reject) => {
         // Set the query
         let query = { userId: userId };
         // Execute the query
         retrieveDocOne("user_auth", query)
             .then(result => {
                 // Check if the user was found
                 if (result == null) {
                     resolve(null);
                     return;
                 }
                // Create an empty UserData object
                let userData = new UserData();
                // Cast the result to UserData object
                userData = userData.cast(result);
                // Set the data type to user auth
                userData.type = UserDataTypes.JUST_AUTH;
                // Pass the result to the callback function
                resolve(userData);
             })
             .catch(err => reject(err));
     });
}

/**
 * Returns true if user ID already exists
 * @param userId {string|UserData}
 * @return {Promise<boolean>}
 */
function userAuthExists (userId){
    if (typeof userId == "UserData") {
         return new Promise((resolve, reject) => {
             userAuthExistsByUserData(userId)
                 .then(exists => resolve(exists))
                 .catch(err => reject(err))
         });
    } else {
        return new Promise((resolve, reject) => {
            // Set the query
            let query = { userId: userId };
            // Execute the query
            retrieveDocOne("user_auth", query)
                .then(result => {
                    // This function doesn't expressively need a callback
                    resolve(result != null);
                })
                .catch(err => reject(err));
        });
    }
}

/**
 * Returns true if user ID already exists
 * @param userData {UserData}
 * @return {Promise<boolean>}
 */
function userAuthExistsByUserData (userData){
    return new Promise((resolve, reject) => {
        // Set the queries
        let filter = { $or:
                [
                    {username: userData.username},
                    {email: userData.email}
                ]
        };
        // Execute the queries
        // TODO
        //  use "retrieveDocManyEach" since "retrieveDocManyAll" hangs the main thread because of the methods it uses
        retrieveDocManyAll("user_info", filter)
            .then(result => {
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
                resolve(message);
            })
            .catch(err => reject(err));
    });
}

/**
 * Find user auth by username
 * @param username {string} - The username to look for
 * @return {Promise<UserData>}
 */
function userAuthByUsername (username){
     return new Promise((resolve, reject) => {
         // WARN: This function gets the userId from user_info and then uses that to get the user_auth. This is not good
         // Set the query for the user info
         let query = { username: username };
         // Execute the query
         retrieveDocOne("user_auth", query)
             .then(result => {
                 // Check if the user was found
                 if (result == null) {
                     resolve(null);
                     return;
                 }
                // Create an empty UserData object
                let userAuthData = new UserData();
                // Cast the result to UserData object
                userAuthData = userAuthData.cast(result);
                // Set the data type to user auth
                userAuthData.type = UserDataTypes.JUST_AUTH;
                // Pass the result to the callback function
                resolve(userAuthData);
             })
             .catch(err => reject(err));
     });
}

/**
 * Get the active state of the account
 * @param {string} userId
 * @return {Promise<boolean>}
 */
function userAuthGetActive (userId){
    return new Promise((resolve, reject) => {
        // Set the query for the user info
        let query = { userId: userId };
        // Execute the query
        retrieveDocOne("user_auth", query)
            .then(result => {
                // Check if the user was found
                if (result == null) {
                    resolve(null);
                    return;
                }
                // Create an empty UserData object
                let userAuthData = new UserData();
                // Cast the result to UserData object
                userAuthData = userAuthData.cast(result);
                // Set the data type to user auth
                userAuthData.type = UserDataTypes.JUST_AUTH;
                // Pass the result to the callback function
                resolve(userAuthData.active);
            })
            .catch(err => reject(err));
    });
}

/**
 * Retrieves the user's details by username
 * @param username {string} - The username to look for
 * @return {Promise<UserData>}
 */
 function userByUsername (username){
    return new Promise((resolve, reject) => {
        // Set the query
        let query = { username: username };
        // Execute the query
        retrieveDocOne("user_info", query)
            .then(result => {
                // Check if the user was found
                if (result == null) {
                    resolve(null);
                    return;
                }
                // Create an empty UserData object
                let userData = new UserData();
                // Cast the result to UserData object
                userData = userData.cast(result);
                // Set the data type to user auth
                userData.type = UserDataTypes.JUST_DETAILS;
                // Pass the result to the callback function
                resolve(userData);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

// ------------------------- Channel Related -------------------------

/**
 * Retrieves the channel from the username given
 * This method is twice slower than find channel by userId
 * @param {string} username
 * @return {Promise<ChannelData>}
 */
function channelByUsername (username){
    return new Promise((resolve, reject) => {
        // Get the user
        userByUsername(username)
            .then(user => {
                channelByUserId(user.userId)
                    .then(channel => {
                        resolve(channel);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

/**
 * Retrieves the channel from the userId given
 * @param {string} userId
 * @return {Promise<ChannelData>}
 */
function channelByUserId (userId){
    return new Promise((resolve, reject) => {
        // Set the query
        let query = { userId: userId };
        retrieveDocOne("channel_data", query)
            .then(result => {
                // Check if the user was found
                if (result == null) {
                    resolve(null);
                    return;
                }
                // Create an empty UserData object
                let channelData = new ChannelData();
                // Cast the result to UserData object
                channelData = channelData.cast(result);
                // Pass the result to the callback function
                resolve(channelData);
            })
            .catch(err => reject(err));
    });
}

/**
 * Checks if the stream key exists
 * @param {string} streamKey
 * @return {Promise<boolean>}
 */
function channelStreamKeyExists(streamKey) {
    return new Promise((resolve, reject) => {
        // Set the query
        let query = { streamKey: streamKey }
        // Execute the query
        retrieveDocOne("channel_data", query)
            .then(result => resolve(result != null))
            .catch(err => reject(err));
     });
}

// ------------------------- Algorithm Related -------------------------

/**
 * Retrieves the current online channels on the database
 * @return {Promise<ChannelData[]>}
 */
function algoChannelsCurrentOnline() {
    return new Promise((resolve, reject) => {
        // Set the query
        let query = { channelStatus: ChannelStatus.ONLINE }
        // TODO:
        //  start caching this, it's not optimal to always access the database on every request.
        retrieveDocManyLimit("channel_data", query, 5)
            .then((results) => {
                // Define the return array
                let resultArray = [];
                // Cast each of the results to a channelData object
                results.forEach((obj) => {
                    // Define the channel for this document
                    let channel = new ChannelData();
                    // Unbox it
                    channel = channel.cast(obj);
                    // Add it to the results array
                    resultArray.push(channel);
                });
                // Successful callback
                resolve(resultArray);
            })
            .catch(err => reject(err));
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
    channelByUsername,
    channelStreamKeyExists,
    algoChannelsCurrentOnline,
}