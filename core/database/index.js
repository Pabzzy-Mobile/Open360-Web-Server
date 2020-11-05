// Define this object's info
const moduleInfo = {};
moduleInfo.name = "Database Access";
moduleInfo.description = "This module defines the Database codebase for Open360";

console.log("Loading Database Modules");
const util = require("./util.js");
const raw = require("./database.js");
const find = require("./find.js");
const write = require("./write.js");

module.exports = {
    moduleInfo,
    util: util,
    raw: raw,
    find: find,
    write: write
}