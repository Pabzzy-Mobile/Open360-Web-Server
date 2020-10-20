// Require the MongoDB driver
const MongoDB = require('mongodb').MongoClient;

// Define the database access object
let DatabaseAccess = {};

// Define this object's info
DatabaseAccess.moduleInfo = {};
DatabaseAccess.moduleInfo.name = "Database Access";
DatabaseAccess.moduleInfo.description = "This module defines the Database codebase for Open360";

// Database Access Variables
DatabaseAccess.url = 'mongodb://open360-mongodb:27017';
DatabaseAccess.dbName = 'user_data';

DatabaseAccess.getCollection = function (collectionName, callback){
    // Set the database client
    let MongoClient = new MongoDB(DatabaseAccess.url);
    // Try to connect to the database
    try {
        // Connect to the database
        MongoClient.connect(function (err, client) {
            if (err) console.error(err);
            // Set the MongoClient to the connected client which is basically the same but they are currently living in
            // different places in memory so let's move them into the same household
            MongoClient = client;
            // Set what database the client should access
            let db = MongoClient.db(DatabaseAccess.dbName);
            // Define the user database collection
            let collection = db.collection(collectionName);
            callback(MongoClient, collection)
        });
    } finally {
        MongoClient.close();
    }
}

// Define the find section of Database Access
DatabaseAccess.find = {};

/**
 * Find user by userId
 * @param userId - The userId to look for
 * @param callback - The callback function
 * @returns {boolean} - Indicates if the user has been found
 */
DatabaseAccess.find.userInfo = function (userId, callback){
    // Get the collection
    DatabaseAccess.getCollection("users", function (client, usersCollection){
        // Set the query
        let query = { userId: userId };
        // Execute the query
        let result = usersCollection.findOne(query);
        // Pass the result to the callback function
        callback(result);
    });
}

DatabaseAccess.find.userByUsername = function (username, callback){
    // Get the collection
    DatabaseAccess.getCollection("users", function (client, usersCollection){
        // Set the query
        let query = { username: username };
        // Execute the query
        usersCollection.findOne(query, function (err, result) {
            if (err) console.error(err);
            // Pass the result to the callback function
            callback(result);
        });
    });
}

// Export the DatabaseAccess object
module.exports = DatabaseAccess;