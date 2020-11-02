// Require the MongoDB driver
const {MongoClient, Collection} = require('mongodb');
// Require the Util module
const Util = require('../util');

// Database Access Variables
let url = 'mongodb://open360-mongodb:27017';
let dbName = 'user_data';

// ---------------- * * Query Methods * * ----------------

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
function getCollection(collectionName, callback){
    // Change the timeout from connecting to the server and change the connection count to 1 just in case a connection
    // isn't closed
    let options = { useNewUrlParser: true, connectTimeoutMS: 30000, keepAlive: 1 };
    // Set the database client
    let mongoClient = new MongoClient(url, options);
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
            let db = mongoClient.db(dbName);
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
function retrieveDocOne(collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
 * @callback retrieveDocManyCallback
 * @param {Error} err
 * @param {Object[]} result
 */

/**
 * Retrieves documents in the collection using the query
 * @param {string} collectionName
 * @param {Object} query
 * @param {retrieveDocManyCallback} [callback]
 * @returns {Object[]} - If no callback is provided, it will return the result of the transaction
 */
function retrieveDocManyAll (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
            // Find all the documents according to the query
            collection.find(query, function (err, resultCursor) {
                // Array the
                resultCursor.toArray(function (err, array){
                    // Callback with a null error and return true
                    if (typeof callback == "function") callback(null, array);
                    return array;
                });
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
 * @callback retrieveDocManyEachCallback
 * @param {Error} err
 * @param {Object} element
 */

/**
 * Retrieves documents in the collection using the query, callback on every element
 * @param {string} collectionName
 * @param {Object} query
 * @param {retrieveDocManyEachCallback} callback
 */
function retrieveDocManyEach (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
            // Find all the documents according to the query
            collection.find(query, function (err, resultCursor) {
                // Array the
                resultCursor.forEach(function (element){
                    // Callback with a null error and return true
                    callback(null, element);
                });
            });
        });
    } catch (err) {
        // If there was an error print it out and return false
        console.error(err);
        // Send the error to the callback
        callback(err, null);
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
function updateDocOne (collectionName, document, filter, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
function updateDocMany (collectionName, documents, filters, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
function insertDocOne (collectionName, document, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
function insertDocMany (collectionName, documents, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
function deleteDocOne (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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
function deleteDocMany (collectionName, query, callback){
    // Try to connect to the database
    try {
        // Retrieve the collection
        getCollection(collectionName, function (err, collection) {
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

// Export the DatabaseAccess object
module.exports = {
    updateDocOne,
    updateDocMany,
    insertDocOne,
    insertDocMany,
    getCollection,
    deleteDocOne,
    deleteDocMany,
    retrieveDocOne,
    retrieveDocManyAll,
    retrieveDocManyEach
};