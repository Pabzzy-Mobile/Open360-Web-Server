// Require the util module
const {UserData, UserDataTypes, ChannelData, ChannelModule, ChannelStatus} = require("../util.js");
// Require other database files
// const util = require("./util.js");
const {insertDocOne, updateDocOne, deleteDocOne} = require("./database.js");
const {userAuthGetActive} = require("./find.js");

// ------------------------- * Write Methods * -------------------------

// ------------------------- User Related -------------------------

/**
 *
 * @param {UserData} userData
 * @return {Promise<boolean>}
 */
function addUserAllInfo(userData){
    return new Promise((resolve, reject) => {
        if (!userData.type === UserDataTypes.ALL_INFO) {
            reject(new Error("User was not of type 'ALL_INFO'"));
            return;
        }
        let promises = [
            // Insert the user's auth into the collection
            addUserAuth(userData),
            // Insert the user's details into the collection
            addUserDetails(userData)
        ]
        // Run both of those
        Promise.all(promises).then(data => {
            resolve(true);
        });
    });
}

/**
 *
 * @param {UserData} userData
 * @return {Promise<boolean>}
 */
function addUserDetails (userData){
    return new Promise((resolve, reject) => {
        if (!userData.type === UserDataTypes.JUST_DETAILS) {
            reject(new Error("User was not of type 'JUST_DETAILS'"));
            return;
        }
        // Set the user doc to add
        let doc = {userId: userData.userId, username: userData.username, email: userData.email, displayName: userData.displayName, subscriptions: userData.subscriptions };
        // Insert the user doc
        insertDocOne("user_info", doc)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 *
 * @param {UserData} userData
 * @return {Promise<boolean>}
 */
function addUserAuth (userData){
    return new Promise((resolve, reject) => {
        if (!userData.type === UserDataTypes.JUST_AUTH) {
            reject(new Error("User was not of type 'JUST_AUTH'"));
            return;
        }
        // Set the user doc to add
        let doc = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: true };
        // Insert the user doc
        insertDocOne("user_auth", doc)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 *
 * @param {UserData} userData
 * @return {Promise<boolean>}
 */
function updateUserAuth (userData){
    return new Promise((resolve, reject) => {
        if (!userData.type === UserDataTypes.JUST_AUTH) {
            reject(new Error("User was not of type 'JUST_AUTH'"));
        }
        // Set the filter
        let filter = {userId: userData.userId};
        // Define the replacing document
        let replacingUser = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: userData.active};
        // Insert the user doc
        updateDocOne("user_auth", replacingUser, filter)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 * Set the active status of a user account by user Id
 * @param {string} userId - User Id to look for
 * @param {boolean} newActive - Account activated status
 * @return {Promise<boolean>}
 */
function setActiveUserAuth (userId, newActive){
    return new Promise((resolve, reject) => {
        // Set the filter to find the user by Id
        let filter = {userId: userId};
        // Set what fields the database should modify
        let doc = {$set: {active: newActive}};
        updateDocOne("user_auth", doc, filter)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 * Removes a user's account from the Auth collection by userId
 * @param {string} userId
 * @param {boolean} force - delete document regardless of active status
 * @return {Promise<boolean>}
 */
function removeUserAuth (userId, force) {
    return new Promise((resolve, reject) => {
        userAuthGetActive(userId)
            .then(active => {
            // Don't delete if the account has not been deactivated yet
            if (active && !force){
                reject(new Error("This account is still active, deletion failed"));
                return;
            }
            // Set the filter
            let filter = {userId: userId};
            // Execute order 66
            deleteDocOne("user_auth", filter)
                .then(deleteCount => resolve(deleteCount))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

// ------------------------- Channel Related -------------------------

/**
 * @param {ChannelData} channelData
 * @return {Promise<boolean>}
 */
function addChannel (channelData) {
    return new Promise((resolve, reject) => {
        // Make the document
        let doc = {
            userId: channelData.userId,
            username: channelData.username,
            streamKey: channelData.streamKey,
            channelStatus: channelData.channelStatus,
            modules: channelData.modules,
            title: channelData.title,
            description: channelData.description,
            tags: channelData.tags,
            directory: channelData.directory
        };
        // Insert the doc
        insertDocOne("channel_data", doc)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 * Sets the status of a channel on the database
 * @param {string} userId
 * @param {ChannelStatus} newStatus
 * @return {Promise<boolean>}
 */
function setChannelStatus (userId, newStatus){
    return new Promise((resolve, reject) => {
        // Set the filter to find the channel by userId
        let filter = {userId: userId};
        // Set what fields the database should modify
        let doc = {$set: {channelStatus: newStatus}};
        updateDocOne("channel_data", doc, filter)
            .then(success => resolve(success))
            .catch(err => reject(err));
    });
}

/**
 * Sets the status of a channel on the database
 * @param {string} userId
 * @param {ChannelModule} module
 * @return {Promise<boolean>}
 */
function addModule (userId, module){
    return new Promise((resolve, reject) => {
        // Set the filter to find the channel by userId
        let filter = {userId: userId};
        // Set what fields the database should modify
        let doc = {$push: {modules: module.moduleId}};
        let promises = [
            // Insert the user's auth into the collection
            updateDocOne("channel_data", doc, filter),
            // Insert the user's details into the collection
            insertDocOne("module_data", module)
        ]
        // Run both of those
        Promise.all(promises)
            .then(data => resolve(data[0] && data[1]))
            .catch(err => reject(err));
    });
}

function removeModule (userId, module, callback){
    return new Promise((resolve, reject) => {
        // Set the filter to find the channel by userId
        let filter = {userId: userId};
        // Set what fields the database should modify
        let doc = {$pull: {modules: module.moduleId}};
        // Set the delete filter
        let deleteFilter = {moduleId: module.moduleId}
        let promises = [
            // Insert the user's auth into the collection
            updateDocOne("channel_data", doc, filter),
            // Insert the user's details into the collection
            deleteDocOne("module_data", deleteFilter)
        ]
        // Run both of those
        Promise.all(promises)
            .then(data => resolve(data[0] && data[1]))
            .catch(err => reject(err));
    });
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