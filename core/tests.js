const Util = require("./util");
const DatabaseAccess = require("./database.js");

// Define the Tests module
let Tests = {};

// Define this object's info
Tests.moduleInfo = {};
Tests.moduleInfo.name = "Server Tests";
Tests.moduleInfo.description = "This module tests the various components of Open360";

/**
 * @summary Run the server tests.
 *
 * These include, but are not limited to:
 * - Database Codebase Tests
 */
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
    let userToTest = new Util.UserData();
    // Set the user's details
    userToTest.type = Util.UserDataTypes.JUST_AUTH
    userToTest.userId = "c9dc993100e7fc30dbc0769deb19dba15bfbc5bf";
    userToTest.username = "Jonny554";
    userToTest.password = "f77d7271e109fc01ea3bee60052b9e671886cadebec3a6aea3f1a2b1c42014b8"
    userToTest.salt = "6RtAMLCs";
    // Add the user to the database
    DatabaseAccess.write.addUserAuth(userToTest, function (err){
        if (err) console.error(err);
    });
    // Find the user and check if it was successfully added
    DatabaseAccess.find.userAuth("c9dc993100e7fc30dbc0769deb19dba15bfbc5bf", function (user){
        // Check if the user can be found
        insertPassed = user.userId === userToTest.userId;
        insertPassed &= user.username === userToTest.username;
    });
    // Remove the user from the database
    DatabaseAccess.getCollection("user_auth", function (client, usersCollection){
        usersCollection.deleteOne({userId: "c9dc993100e7fc30dbc0769deb19dba15bfbc5bf", username: "jonny554"});
    });
    // Check if the user is still on the database
    DatabaseAccess.find.userAuth("c9dc993100e7fc30dbc0769deb19dba15bfbc5bf", function (user){
        // Check if the user can be found
        deletePassed = user === null
    });
    // Check if the tests passed and send some error info if not
    if (!insertPassed) console.error("Database User insertion didn't pass");
    if (!deletePassed) console.error("Database User deletion didn't pass");
    return insertPassed && deletePassed;
}

// Export the module
module.exports = Tests;