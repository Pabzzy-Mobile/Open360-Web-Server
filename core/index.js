console.log("Loading Database Module");
let DatabaseAccess = require("./database.js");
console.log("Loading Tests Module");
let Tests = require("./tests.js");

module.exports = {
    DatabaseAccess: DatabaseAccess,
    Tests: Tests
}