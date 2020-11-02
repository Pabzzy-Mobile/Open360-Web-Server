console.log("Loading Util Module");
let Util = require("./util.js");
console.log("Loading Database Module");
let DatabaseAccess = require("./database.js");
console.log("Loading HTTP Responses Module");
let HTTPResponses = require("./httphandlers.js");
console.log("Loading Tests Module");
let Tests = require("./tests.js");

module.exports = {
    Util: Util,
    DatabaseAccess: DatabaseAccess,
    HTTPResponses: HTTPResponses,
    Tests: Tests
}