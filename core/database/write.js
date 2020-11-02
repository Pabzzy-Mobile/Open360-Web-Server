// Require the util module
const {UserData, UserDataTypes, ChannelData, ChannelStatus} = require("../util.js");
// Require other database files
// const util = require("./util.js");
const {userAuthGetActive} = require("./find.js");
const {insertDocOne, updateDocOne, deleteDocOne} = require("./database");

// ------------------------- * Write Methods * -------------------------

// ------------------------- User Related -------------------------

/**
 * @callback newUserCallback
 * @param {Error} err
 */

/**
 *
 * @param {UserData} userData
 * @param {newUserCallback} [callback]
 */
function addUserAllInfo(userData, callback){
    if (!userData.type === UserDataTypes.ALL_INFO) {
        callback(new Error("User was not of type 'ALL_INFO'"));
        return;
    }
    // Insert the user's auth into the collection
    addUserAuth(userData);
    // Insert the user's details into the collection
    addUserDetails(userData);
    callback(null);
}

/**
 *
 * @param {UserData} userData
 * @param {newUserCallback} [callback]
 */
function addUserDetails (userData, callback){
    if (!userData.type === UserDataTypes.JUST_DETAILS) {
        callback(new Error("User was not of type 'JUST_DETAILS'"));
        return;
    }
    // Set the user doc to add
    let doc = {userId: userData.userId, username: userData.username, email: userData.email, displayName: userData.displayName, subscriptions: userData.subscriptions };
    // Insert the user doc
    insertDocOne("user_info", doc, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 *
 * @param {UserData} userData
 * @param {newUserCallback} [callback]
 */
function addUserAuth (userData, callback){
    if (!userData.type === UserDataTypes.JUST_AUTH) {
        callback(new Error("User was not of type 'JUST_AUTH'"));
        return;
    }
    // Set the user doc to add
    let doc = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: true };
    // Insert the user doc
    insertDocOne("user_auth", doc, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 * @callback updateUserCallback
 * @param {Error} err
 */

/**
 *
 * @param {UserData} userData
 * @param {updateUserCallback} [callback]
 */
function updateUserAuth (userData, callback){
    if (!userData.type === UserDataTypes.JUST_AUTH) {
        callback(new Error("User was not of type 'JUST_AUTH'"))
    }
    // Set the filter
    let filter = {userId: userData.userId};
    // Define the replacing document
    let replacingUser = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: userData.active};
    // Insert the user doc
    updateDocOne("user_auth", replacingUser, filter, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 * Set the active status of a user account by user Id
 * @param {string} userId - User Id to look for
 * @param {boolean} newActive - Account activated status
 * @param {updateUserCallback} callback
 */
function setActiveUserAuth (userId, newActive, callback){
    // Set the filter to find the user by Id
    let filter = {userId: userId};
    // Set what fields the database should modify
    let doc = {$set: {active: newActive}};
    updateDocOne("user_auth", doc, filter, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 * Removes a user's account from the Auth collection by userId
 * @param {string} userId
 * @param {boolean} force - delete document regardless of active status
 * @param {updateUserCallback} callback
 */
function removeUserAuth (userId, force, callback) {
    userAuthGetActive(userId, function (err, active) {
        if (err != null) {
            callback(err);
            return false;
        }
        // Don't delete if the account has not been deactivated yet
        if (active && !force){
            callback(new Error("This account is still active, deletion failed"));
            return false;
        }
        // Set the filter
        let filter = {userId: userId};
        // Execute order 66
        deleteDocOne("user_auth", filter, function (err){
            // This function doesn't expressively need a callback
            if (callback != null && typeof callback == "function") callback(err);
        });
    });
}

// ------------------------- Channel Related -------------------------

/**
 * @callback insertChannelCallback
 * @param {Error} err
 */

/**
 * @param {ChannelData} channelData
 * @param {insertChannelCallback} callback
 */
function addChannel (channelData, callback) {
    insertDocOne("channel_data", channelData, callback);
}

/**
 * @callback updateChannelCallback
 * @param {Error} err
 */

/**
 * Sets the status of a channel on the database
 * @param {string} userId
 * @param {ChannelStatus} newStatus
 * @param {updateChannelCallback} [callback]
 */
function setChannelStatus (userId, newStatus, callback){
    // Set the filter to find the channel by userId
    let filter = {userId: userId};
    // Set what fields the database should modify
    let doc = {$set: {channelStatus: newStatus}};
    updateDocOne("channel_data", doc, filter, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

function addModule (userId, module, callback){
    // Set the filter to find the channel by userId
    let filter = {userId: userId};
    // Set what fields the database should modify
    let doc = {$push: {modules: module.moduleId}};
    updateDocOne("channel_data", doc, filter, function (err){
        if (err) callback(err);
    });
    insertDocOne("module_data", module, function (err) {
        if (err) callback(err);
    });
    callback(null);
}

function removeModule (userId, module, callback){
    // Set the filter to find the channel by userId
    let filter = {userId: userId};
    // Set what fields the database should modify
    let doc = {$pull: {modules: module.moduleId}};
    updateDocOne("channel_data", doc, filter, function (err){
        if (err) callback(err);
    });
    // Set the delete filter
    let deleteFilter = {moduleId: module.moduleId}
    deleteDocOne("module_data", deleteFilter, function (err) {
        if (err) callback(err);
    });
    callback(null);
}

module.exports = {
    addUserAllInfo,
    addUserDetails,
    addUserAuth,
    addChannel,
    addModule,
    removeModule,
    removeUserAuth,
    setActiveUserAuth,
    setChannelStatus
}