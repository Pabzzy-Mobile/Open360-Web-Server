// Define this object's info
let moduleInfo = {};
moduleInfo.name = "Database Access";
moduleInfo.description = "This module defines the Database codebase for Open360";

console.log("Loading Database Modules");
let raw = require("./database");
let find = require("./find.js");
let write = require("./write.js");

module.exports = {
    moduleInfo,
    find: find,
    write: write
}