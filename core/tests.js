const DatabaseAccess = require("./database.js");

// Define the Tests module
let Tests = {};

// Define this object's info
Tests.moduleInfo = {};
Tests.moduleInfo.name = "Server Tests";
Tests.moduleInfo.description = "This module tests the various components of Open360";

// Define the run tests function
Tests.run = function () {
    // Array contains the results of all the Database Tests
    let databaseTests = [];

    // Run the Insert Delete Test
    databaseTests.push(Tests.DatabaseTests.testInsertDelete());

    if (!Tests.hasPassed(databaseTests)) {
        throw new Error("Database Tests did not pass. Check output.");
    } else {
        console.info("Database Tests Passed");
    }
}

// Utility functions of Tests

/** Returns true if all the tests in the array are true
 * @param testArray - array with the result boolean of tests
 * @returns {boolean}
 */
Tests.hasPassed = function (testArray){
    // Define the return variable
    let passed = true;
    // Loop through each test in the array and check if they passed
    for (let i = 0; i < testArray.length; i++) {
        // AND the test to the return variable
        passed &= testArray[i];
    }
    return passed;
}

// This object is were all the tests for the database module are defined in
Tests.DatabaseTests = {};

/**
 * Inserts a user into the database and deletes it
 * @returns {boolean} - Returns true if the test completed successfully
 */
Tests.DatabaseTests.testInsertDelete = function (){
    let insertPassed = true;
    let deletePassed = true;
    DatabaseAccess.getCollection("users", function (client, usersCollection) {
        // Test user insertion
        usersCollection.insertOne({userId: -1100, username: "jonny554"})
    });
    DatabaseAccess.find.userInfo(-1100, function (user){
        // Check if the user can be found
        insertPassed = user.userId === -1100
    });
    DatabaseAccess.getCollection("users", function (client, usersCollection){
        usersCollection.deleteOne({userId: -1100, username: "jonny554"});
    });
    DatabaseAccess.find.userInfo(-1100, function (user){
        // Check if the user can be found
        deletePassed = user === null
    });
    if (!insertPassed) console.error("Database User insertion didn't pass");
    if (!deletePassed) console.error("Database User deletion didn't pass");
    return insertPassed && deletePassed;
}

// Export the module
module.exports = Tests;