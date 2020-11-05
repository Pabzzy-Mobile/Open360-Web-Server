const Util = require("./util.js");
const DatabaseAccess = require("./database/");

// Define this object's info
const moduleInfo = {};
moduleInfo.name = "Server Tests";
moduleInfo.description = "This module tests the various components of Open360";

/**
 * @summary Run the server tests.
 *
 * These include, but are not limited to:
 * - Database Codebase Tests
 */
function runTests() {
    // Array contains the results of all the Database Tests
    let databaseTests = [];

    // Run the Insert Delete Test
    databaseTests.push(testInsertDelete());

    if (!hasPassed(databaseTests)) {
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
function hasPassed(testArray) {
    // Define the return variable
    let passed = true;
    // Loop through each test in the array and check if they passed
    for (let i = 0; i < testArray.length; i++) {
        // AND the test to the return variable
        passed &= testArray[i];
    }
    return passed;
}

/**
 * Inserts a user into the database and deletes it
 * @returns {boolean} - Returns true if the test completed successfully
 */
function testInsertDelete() {
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
    DatabaseAccess.write.addUserAuth(userToTest)
        .then(success => {
            insertPassed &= success;
        })
        .catch(err => console.error(err));
    // Find the user and check if it was successfully added
    DatabaseAccess.find.userAuthByUserId(userToTest.userId)
        .then(user => {
            // Check if the user can be found
            insertPassed = user.userId === userToTest.userId;
            insertPassed &= user.username === userToTest.username;
        })
        .catch(err => console.error(err));
    // Remove the user from the database
    DatabaseAccess.write.removeUserAuth(userToTest.userId, true)
        .then(success => {
            insertPassed &= success;
        })
        .catch(err => console.error(err));
    // Check if the user is still on the database
    DatabaseAccess.find.userAuthByUserId(userToTest.userId)
        .then(user => {
            // Check if the user can be found
            deletePassed = user === null;
        })
        .catch(err => console.error(err));
    // Check if the tests passed and send some error info if not
    if (!insertPassed) console.error("Database User insertion didn't pass");
    if (!deletePassed) console.error("Database User deletion didn't pass");
    return insertPassed && deletePassed;
}

// Export the module
module.exports = {
    moduleInfo,
    run: runTests
};