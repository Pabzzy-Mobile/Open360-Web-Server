// Require the MongoDB driver
const {MongoClient, Collection} = require('mongodb');
// Require the Util module
const Util = require('./util');
const {UserData, UserDataTypes} = require('./util');

// Define the database access object
let DatabaseAccess = {};

// Define this object's info
DatabaseAccess.moduleInfo = {};
DatabaseAccess.moduleInfo.name = "Database Access";
DatabaseAccess.moduleInfo.description = "This module defines the Database codebase for Open360";

// Database Access Variables
DatabaseAccess.url = 'mongodb://open360-mongodb:27017';
DatabaseAccess.dbName = 'user_data';

/**
 * @callback collectionRetrievedCallback
 * @param {MongoClient} client
 * @param {Collection} collection
 */

/**
 * @summary Retrieves a collection from the database and passes it to the callback
 * Makes a connection to the database and retrieves the collection to use in the callback function.
 * After the callback finishes, the connection is closed.
 * @param {string} collectionName
 * @param {collectionRetrievedCallback} callback
 */
DatabaseAccess.getCollection = function (collectionName, callback){
    // Change the timeout from connecting to the server and change the connection count to 1 just in case a connection
    // isn't closed
    let options = { useNewUrlParser: true, connectTimeoutMS: 30000, keepAlive: 1 };
    // Set the database client
    let mongoClient = new MongoClient(DatabaseAccess.url, options);
    // Try to connect to the database
    try {
        // Connect to the database
        mongoClient.connect(function (err, client) {
            if (err) {
                console.error(err);
                throw (err);
            }
            // Set the MongoClient to the connected client which is basically the same but they are currently living in
            // different places in memory so let's move them into the same household
            mongoClient = client;
            // Set what database the client should access
            let db = mongoClient.db(DatabaseAccess.dbName);
            // Define the user database collection
            let collection = db.collection(collectionName);
            callback(mongoClient, collection);
        });
    } finally {
        mongoClient.close();
    }
}

/**
 * @callback retrieveDocCallback
 * @param {Error} err
 * @param {Object} result
 */

/**
 * Retrieves one document in the collection using the query
 * @param {string} collectionName
 * @param {Object} query
 * @param {retrieveDocCallback} [callback]
 * @returns {Object} - If no callback is provided, it will return the result of the transaction
 */
DatabaseAccess.retrieveDocOne = function (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Retrieve the document according to the query
            collection.findOne(query, function (err, result) {
                // Callback with a null error and return true
                if (typeof callback == "function") callback(null, result);
                return result;
            });
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err, null);
        return null;
    }
}

/**
 * Retrieves documents in the collection using the query
 * @param {string} collectionName
 * @param {Object} query
 * @param {retrieveDocCallback} [callback]
 * @returns {Object} - If no callback is provided, it will return the result of the transaction
 */
DatabaseAccess.retrieveDocMany = function (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Find all the documents according to the query
            collection.find(query, function (err, resultCursor) {
                // Define the result array
                let resultArray = [];
                // Iterate through and push doc to the results array
                resultCursor.forEach(function (element) {
                    resultArray.push(element);
                });
                // Callback with a null error and return true
                if (typeof callback == "function") callback(null, resultArray);
                return resultArray;
            });
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err, null);
        return null;
    }
}

/**
 * @callback updateDocCallback
 * @param {Error} err
 */

/**
 * Updates one document in the collection using the filter
 * @param {string} collectionName
 * @param {Object} document
 * @param {Object} filter
 * @param {updateDocCallback} [callback]
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.updateDocOne = function (collectionName, document, filter, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Replace the document according to the filter
            collection.replaceOne(filter, document);
            // Callback with a null error and return true
            if (typeof callback == "function") callback(null);
            return true;
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err);
        return false;
    }
}

/**
 * Update each document in documents with the matching filter in filters
 * @param {string} collectionName
 * @param {Object[]} documents - this array should be the same size as filters
 * @param {Object[]} filters - this array should be the same size as documents
 * @param {updateDocCallback} callback
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.updateDocMany = function (collectionName, documents, filters, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Iterate through each document to be replaced
            for (i = 0; i > documents.length && i > filters.length; i++){
                // Replace the document according to the filter
                collection.replaceOne(filters[i], documents[i]);
            }
            // Callback with a null error and return true
            if (typeof callback == "function") callback(null);
            return true;
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err);
        return false;
    }
}

/**
 * @callback insertDocCallback
 * @param {Error} err
 */

/**
 * Insert document into collection
 * @param {string} collectionName
 * @param {Object} document
 * @param {insertDocCallback} [callback]
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.insertDocOne = function (collectionName, document, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Replace the document according to the filter
            collection.insertOne(document);
            // Callback with a null error and return true
            if (typeof callback == "function") callback(null);
            return true;
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err);
        return false;
    }
}

/**
 * Insert document into collection
 * @param {string} collectionName
 * @param {Object} documents
 * @param {insertDocCallback} callback
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.insertDocMany = function (collectionName, documents, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Iterate through each document to be inserted
            for (i = 0; i > documents.length; i++){
                collection.insertOne(documents[i]);
            }
            // Callback with a null error and return true
            if (typeof callback == "function") callback(null);
            return true;
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err);
        return false;
    }
}

/**
 * @callback removeDocCallback
 * @param {Error} err
 * @param {number} deletedCount
 */

/**
 * Delete document into collection
 * @param {string} collectionName
 * @param {Object} query
 * @param {removeDocCallback} callback
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.deleteDocOne = function (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            // Delete the document according to the query
            collection.deleteOne(query, {},function (err, result){
                // Callback with a null error and return true
                if (typeof callback == "function") callback(null, result.deletedCount);
                return true;
            });
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err, 0);
        return false;
    }
}

/**
 * Delete documents into collection
 * @param {string} collectionName
 * @param {Object} query
 * @param {removeDocCallback} callback
 * @returns {boolean} - If no callback is provided it will return true if he operation was successful
 */
DatabaseAccess.deleteDocMany = function (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        DatabaseAccess.getCollection(collectionName, function (err, collection) {
            let deletedCount = 0;
            // If the query is an array iterate through each and delete one document according to it
            switch (Object.prototype.toString.call(query)) {
                case '[object Array]':
                    // Iterate through each query to be deleted
                    for (i = 0; i > query.length; i++){
                        // Replace the document according to the filter
                        collection.deleteOne(query[i], {}, function (mongoError, result) {
                            deletedCount += result.deletedCount;
                        });
                    }
                    break;
                case '[object Object]':
                    // Delete many according to query
                    collection.deleteMany(query, {},function (err, result){
                        deletedCount += result.deletedCount;
                    });
            }
            // Callback with a null error and return true
            if (typeof callback == "function") callback(null, deletedCount);
            return true;
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // If a callback is set, send the error to the callback
        if (typeof callback == "function") callback(err, 0);
        return false;
    }
}

// Define the find section of Database Access
/**
 * This object contains all the methods to read from the database.
 * @type {Object}
 */
DatabaseAccess.find = {};

/*
  TODO LIST:
   REFACTOR USER DETAILS AND USER AUTH
 */

/**
 * @callback userFindCallback
 * @param {Error} err
 * @param {Util.UserData} result
 */

/**
 * Find user details by userId
 * @param userId {string} - The userId to look for
 * @param callback {userFindCallback} - The callback function
 */
DatabaseAccess.find.userDetails = function (userId, callback){
    // Set the query
    let query = { userId: userId };
    // Execute the query
    DatabaseAccess.retrieveDocOne("user_info", query, function (err, result){
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
DatabaseAccess.find.userAuth = function (userId, callback){
    // Set the query
    let query = { userId: userId };
    // Execute the query
    DatabaseAccess.retrieveDocOne("user_auth", query, function (err, result){
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
 * @param userId
 * @param [callback] {userCheckCallback}
 */
DatabaseAccess.find.userAuthExists = function (userId, callback){
    // Set the query
    let query = { userId: userId };
    // Execute the query
    DatabaseAccess.retrieveDocOne("user_auth", query, function (err, result){
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
 * Find user auth by username
 * @param username {string} - The username to look for
 * @param callback {userFindCallback} - The callback function
 */
DatabaseAccess.find.userAuthByUsername = function (username, callback){
    // WARN: This function gets the userId from user_info and then uses that to get the user_auth. This is not good
    // Set the query for the user info
    let query = { username: username };
    // Execute the query
    DatabaseAccess.retrieveDocOne("user_auth", query, function (err, result){
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
 * Retrieves the user's details by username
 * @param username {string} - The username to look for
 * @param callback {userFindCallback} - The callback function
 */
DatabaseAccess.find.userByUsername = function (username, callback){
    // Set the query
    let query = { username: username };
    // Execute the query
    DatabaseAccess.retrieveDocOne("user_info", query, function (err, result){
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

/**
 * Contains all the write queries to the database
 * @type {Object}
 */
DatabaseAccess.write = {}

/**
 * @callback newUserCallback
 * @param {Error} err
 */

/**
 *
 * @param userData {Util.UserData}
 * @param [callback] {newUserCallback}
 */
DatabaseAccess.write.addUserAllInfo = function (userData, callback){
    if (!userData.type === UserDataTypes.ALL_INFO) {
        callback(new Error("User was not of type 'ALL_INFO'"));
        return;
    }
    // Insert the user's auth into the collection
    DatabaseAccess.write.addUserAuth(userData);
    // Insert the user's details into the collection
    DatabaseAccess.write.addUserDetails(userData);
    callback(null);
}

/**
 *
 * @param userData {Util.UserData}
 * @param [callback] {newUserCallback}
 */
DatabaseAccess.write.addUserDetails = function (userData, callback){
    if (!userData.type === UserDataTypes.JUST_DETAILS) {
        callback(new Error("User was not of type 'JUST_DETAILS'"));
        return;
    }
    // Set the user doc to add
    let doc = {userId: userData.userId, username: userData.username, email: userData.email, displayName: userData.displayName, subscriptions: userData.subscriptions };
    // Insert the user doc
    DatabaseAccess.insertDocOne("user_info", doc, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 *
 * @param userData {Util.UserData}
 * @param [callback] {newUserCallback}
 */
DatabaseAccess.write.addUserAuth = function (userData, callback){
    if (!userData.type === UserDataTypes.JUST_AUTH) {
        callback(new Error("User was not of type 'JUST_AUTH'"));
        return;
    }
    // Set the user doc to add
    let doc = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: true };
    // Insert the user doc
    DatabaseAccess.insertDocOne("user_auth", doc, function (err){
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
 * @param {Util.UserData} userData
 * @param {updateUserCallback} [callback]
 */
DatabaseAccess.write.updateUserAuth = function (userData, callback){
    if (!userData.type === UserDataTypes.JUST_AUTH) {
        callback(new Error("User was not of type 'JUST_AUTH'"))
    }
    // Set the filter
    let filter = {userId: userData.userId};
    // Define the replacing document
    let replacingUser = {userId: userData.userId, username: userData.username, password: userData.password, salt: userData.salt, active: userData.active};
    // Insert the user doc
    DatabaseAccess.updateDocOne("user_auth", replacingUser, filter, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 * Set the active status of a user account by user Id
 * @param userId {string} - User Id to look for
 * @param newActive {boolean} - Account activated status
 * @param callback {updateUserCallback}
 */
DatabaseAccess.write.setActiveUserAuth = function (userId, newActive, callback){
    // Set the filter to find the user by Id
    let filter = {userId: userId};
    // Set what fields the database should modify
    let doc = {$set: {active: newActive}};
    DatabaseAccess.updateDocOne("user_auth", doc, filter, function (err){
        // This function doesn't expressively need a callback
        if (callback != null && typeof callback == "function") callback(err);
    });
}

/**
 * Removes a user's account from the Auth collection by userId
 * @param userId {string}
 * @param callback
 */
DatabaseAccess.write.removeUserAuth = function (userId, callback) {
    DatabaseAccess.find.userAuth(userId, function (userData) {
        if (userData == null) {
            callback(new Error("User to delete not found"));
            return false;
        }
        // Don't delete if the account has not been deactivated yet
        if (userData.active){
            callback(new Error("This account is still active, deletion failed"));
            return false;
        }
        // Set the filter
        let filter = {userId: userId};
        // Execute order 66
        DatabaseAccess.deleteDocOne("user_auth", filter, function (err){
            // This function doesn't expressively need a callback
            if (callback != null && typeof callback == "function") callback(err);
        });
    });
}

DatabaseAccess.util = {}

/**
 * Generates a unique userId
 * @return {string}
 */
DatabaseAccess.util.generateUserId = function (){
    let userId = Util.generateString(32);
    if (DatabaseAccess.find.userAuthExists(userId)){
        userId = DatabaseAccess.util.generateUserId();
    }
    return userId;
}


// Export the DatabaseAccess object
module.exports = DatabaseAccess;