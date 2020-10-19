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
DatabaseAccess.MongoClient = null;
DatabaseAccess.db = null;
DatabaseAccess.users = null;

// Define the initialization method
DatabaseAccess.init = function (){
    // Check if it's already initialized
    if (DatabaseAccess.MongoClient != null && DatabaseAccess.db != null) return true;
    // Connect to the database
    MongoDB.connect(DatabaseAccess.url, function (err, client) {
        if (err) console.error(err);
        // Set the database client
        DatabaseAccess.MongoClient = client;
        // Set what database the client should access
        DatabaseAccess.db = DatabaseAccess.MongoClient.db(DatabaseAccess.dbName);
        // Define the user database collection
        DatabaseAccess.users = DatabaseAccess.db.collection('users');
    });
}

// Define the find section of Database Access
DatabaseAccess.find = {};

DatabaseAccess.find.user = function (userId){
    // Check if the user collection has been initialized
    if (DatabaseAccess.users === null) return false;
    // Get the user collection
    let users = DatabaseAccess.users;
}

// Define the debug object
DatabaseAccess.debug = {};

// Test insert (it works by the way)
DatabaseAccess.debug.testInsert = function (){
    DatabaseAccess.users.insert({a: 1});
}

DatabaseAccess.debug.users = function (){
    return DatabaseAccess.users.toString();
}

// Export the DatabaseAccess object
module.exports = DatabaseAccess;