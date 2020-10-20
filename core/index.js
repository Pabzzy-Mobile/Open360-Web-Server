console.log("Loading Util Module");
let Util = require("./util.js");
console.log("Loading Database Module");
let DatabaseAccess = require("./database.js");
console.log("Loading Tests Module");
let Tests = require("./tests.js");

module.exports = {
    DatabaseAccess: DatabaseAccess,
    Tests: Tests,
    Util: Util
}