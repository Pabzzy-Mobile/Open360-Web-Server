// Require the MongoDB driver
const {MongoClient, Collection, Cursor} = require('mongodb');
// Require the database util.js
//const {limitDocsFromCursor} = require('./util.js');

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
 * @return {Promise<Collection>}
 */
function getCollection(collectionName){
    return new Promise((resolve, reject) => {
        // Change the timeout from connecting to the server and change the connection count to 1 just in case a connection
        // isn't closed
        let options = { useNewUrlParser: true, connectTimeoutMS: 30000, keepAlive: 1 };
        // Set the database client
        let mongoClient = new MongoClient(url, options);
        // Connect to the database
        mongoClient.connect().then((client) => {
            // Set the MongoClient to the connected client which is basically the same but they are currently living in
            // different places in memory so let's move them into the same household
            mongoClient = client;
            // Set what database the client should access
            let db = mongoClient.db(dbName);
            // Define the user database collection
            let collection = db.collection(collectionName);
            resolve(collection);
        }).catch((err) => {
            reject(err);
        }).finally(() => {
            mongoClient.close();
        });
    });
}

/**
 * Retrieves one document in the collection using the query
 * @param {string} collectionName
 * @param {Object} query
 * @returns {Promise<Object>}
 */
function retrieveDocOne(collectionName, query){
    return new Promise((resolve, reject) => {
            // Retrieve the collection
            getCollection(collectionName)
                .then((collection) => {
                    // Retrieve the document according to the query
                    collection.findOne(query, function (err, result) {
                        if (err) reject(err);
                        // Callback with a null error and return true
                        resolve(result)
                    });
                })
                .catch (err => {
                    // If there was an error print it out and return false
                    console.error(err);
                    // If a callback is set, send the error to the callback
                    reject(err);
                });
    });
}

/**
 * Retrieves documents in the collection using the query
 * @param {string} collectionName
 * @param {Object} query
 * @returns {Promise<Object[]>}
 */
function retrieveDocManyAll (collectionName, query){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then((collection) => {
                // Find all the documents according to the query
                collection.find(query, function (err, resultCursor) {
                    // Array the
                    resultCursor.toArray(function (err, array){
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(array);
                    });
                });
            })
            .catch (err => {
                // If there was an error print it out and return false
                console.error(err);
                reject(err);
            });
    });
}

/**
 * Retrieves documents in the collection using the query, callback on every element
 * @param {string} collectionName
 * @param {Object} query
 */
function retrieveDocManyEach (collectionName, query){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then((collection) => {
                // Find all the documents according to the query
                collection.find(query, function (err, resultCursor) {
                    if (err) {
                        reject(err);
                        if (resultCursor != null) resultCursor.kill();
                        return;
                    }
                    // Callback on each doc
                    resultCursor.forEach(function (element){
                        // Callback with a null error and return true
                        resolve(element);
                    });
                });
            })
            .catch (err => {
                // If there was an error print it out and return false
                console.error(err);
                // Send the error to the callback
                reject(err);
            });
    });
}

/**
 * Retrieves documents in the collection using the query.
 * @param {string} collectionName
 * @param {Object} query
 * @param {number} limit
 * @return {Promise<Object[]>}
 */
function retrieveDocManyLimit (collectionName, query, limit){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then(collection => {
                // Find all the documents according to the query
                collection.find(query, function (err, resultCursor) {
                    limitDocsFromCursor(resultCursor, limit, true)
                        .then((results) => {
                            // Callback with the result array
                            resolve(results);
                        }).catch((err) => {
                            console.error(err);
                        });
                });
            })
            .catch (err => {
                // If there was an error print it out and return false
                console.error(err);
                // Send the error to the callback
                reject(err);
            });
    });
}

/**
 * Updates one document in the collection using the filter
 * @param {string} collectionName
 * @param {Object} document
 * @param {Object} filter
 * @returns {Promise<boolean>}
 */
function updateDocOne (collectionName, document, filter){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then( collection => {
                // Replace the document according to the filter
                collection.replaceOne(filter, document)
                    .then(result => {
                        resolve(result.ok === 1);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch (err => {
                // If there was an error print it out and return false
                console.error(err);
                reject(err);
            });
    });
}

/**
 * Update each document in documents with the matching filter in filters
 * @param {string} collectionName
 * @param {Object[]} documents - this array should be the same size as filters
 * @param {Object[]} filters - this array should be the same size as documents
 * @returns {Promise<boolean>} - If no callback is provided it will return true if he operation was successful
 */
function updateDocMany (collectionName, documents, filters){
    return new Promise((resolve, reject) => {
            // Retrieve the collection
            getCollection(collectionName)
                .then(collection => {
                    replaceEach(collection, documents, filters)
                        .then((result) => {
                        resolve(result);
                    }).catch(err => {
                        reject(err);
                    });
                })
                .catch (err => {
                    // If there was an error print it out and return false
                    console.error(err);
                    reject(err);
                });
    });
}

/**
 * Replace each doc using the filters
 * @param {Collection} collection
 * @param {Object[]} documents - this array should be the same size as filters
 * @param {Object[]} filters - this array should be the same size as documents
 * @return {Promise<boolean>}
 */
function replaceEach (collection, documents, filters){
    return new Promise((resolve, reject) => {
        let length = Math.max(documents.length, filters.length);
        // Iterate through each document to be replaced
        for (let i = 1; i <= length; i++){
            // Replace the document according to the filter
            collection.replaceOne(filters[i - 1], documents[i - 1])
                .then((result) => {
                    if (i === length){
                        resolve(result.ok === 1);
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        }
    });
}

/**
 * Insert document into collection
 * @param {string} collectionName
 * @param {Object} document
 * @returns {Promise<boolean>} - If no callback is provided it will return true if he operation was successful
 */
function insertDocOne (collectionName, document){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then(collection => {
            // Replace the document according to the filter
            collection.insertOne(document)
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    // If there was an error print it out and return false
                    console.error(err);
                    reject(err);
                });
        });
    });
}

/**
 * Insert document into collection
 * @param {string} collectionName
 * @param {Object} documents
 * @returns {Promise<boolean>}
 */
function insertDocMany (collectionName, documents){
    return new Promise((resolve, reject) => {
        getCollection(collectionName)
            .then(collection => {
            insertEach(collection)
                .then((result) => {
                    resolve(result);
                });
            }).catch(err => {
                // If there was an error print it out and return false
                console.error(err);
                reject(err);
            });
    });
}

function insertEach(collection, documents){
    return new Promise((resolve, reject) => {
        let length = documents.length;
        // Iterate through each document to be inserted
        for (let i = 1; i <= length; i++){
            collection.insertOne(documents[i - 1])
                .then(() => {
                    if (i === length){
                        resolve(true);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        }
    });
}

/**
 * Delete document into collection
 * @param {string} collectionName
 * @param {Object} query
 * @returns {Promise<number>} - Number of documents deleted
 */
function deleteDocOne (collectionName, query){
    return new Promise((resolve, reject) => {
        // Retrieve the collection
        getCollection(collectionName)
            .then(collection => {
            // Delete the document according to the query
            collection.deleteOne(query, {})
                .then(result => {
                    resolve(result.deletedCount);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
            });
    });
}

/**
 * Delete documents into collection
 * @param {string} collectionName
 * @param {Object[]|Object} query
 * @returns {Promise<number>} - number of deleted documents
 */
function deleteDocMany (collectionName, query){
    return new Promise((resolve, reject) => {
        getCollection(collectionName)
            .then(collection => {
                // If the query is an array iterate through each and delete one document according to it
                switch (Object.prototype.toString.call(query)) {
                    case '[object Array]':
                        deleteEach(collection, query)
                            .then((deletedCount) => {
                                resolve(deletedCount);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                        break;
                    case '[object Object]':
                        // Delete many according to query
                        collection.deleteMany(query, {})
                            .then(result => {
                                resolve(result.deletedCount);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                }
        });
    });
}

/**
 * Delete each document according to array of queries
 * @param {Collection} collection
 * @param {Object[]} queries
 * @return {Promise<number>} deleted count
 */
function deleteEach(collection, queries){
    return new Promise((resolve, reject) => {
        let deletedCount = 0;
        let length = queries.length;
        // Iterate through each query to be deleted
        for (let i = 1; i >= length; i++){
            // Replace the document according to the filter
            collection.deleteOne(query[i - 1], {})
                .then(result => {
                    deletedCount += result.deletedCount;
                    if (i === length){
                        resolve(deletedCount);
                    }
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                })
        }
    });
}

// ---------------- Utility but not in Util.js

/**
 * Returns an array with the next values from the cursor limited by the limit argument. If killCursor is set to true,
 * the cursor will be killed at the end of the operation
 * @param {Cursor} resultCursor
 * @param {number} limit
 * @param {boolean} killCursor
 * @return {Promise<Object[]>}
 */
function limitDocsFromCursor(resultCursor, limit, killCursor = true){
    return new Promise((resolve, reject) => {
        readCursorOntoArray(resultCursor, limit)
            .then((resultArray) => {
                if (killCursor)
                    // Kill the cursor after the loop
                    resultCursor.kill();
                resolve(resultArray);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

/**
 * @param {Cursor} resultCursor
 * @param {number} limit
 * @return {Promise<Object[]>}
 */
function readCursorOntoArray(resultCursor, limit){
    return new Promise((resolve, reject) => {
        // Define the result array
        let resultArray = [];
        for (let i = 1; i <= limit; i++){
            resultCursor.hasNext().then((hasNext) => {
                if (!hasNext) {
                    resolve(resultArray);
                    return;
                }
                // Get the next document
                resultCursor.next().then((document) => {
                    // Push it to the result array
                    resultArray.push(document);
                    // Check if we have hit the limit
                    if (i === limit) {
                        resolve(resultArray);
                    }
                }).catch((err) => {
                    reject(err);
                });
            })
        }
    });
}

// Export the DatabaseAccess object
module.exports = {
    updateDocOne: updateDocOne,
    updateDocMany: updateDocMany,
    insertDocOne: insertDocOne,
    insertDocMany: insertDocMany,
    getCollection: getCollection,
    deleteDocOne: deleteDocOne,
    deleteDocMany: deleteDocMany,
    retrieveDocOne: retrieveDocOne,
    retrieveDocManyAll: retrieveDocManyAll,
    retrieveDocManyEach: retrieveDocManyEach,
    retrieveDocManyLimit: retrieveDocManyLimit
};