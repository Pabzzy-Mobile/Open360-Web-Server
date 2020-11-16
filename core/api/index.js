// Define this object's info
const moduleInfo = {};
moduleInfo.name = "Core Internal API";
moduleInfo.description = "This module is used to communicate between microservices of Open360";

console.log("Loading Database Modules");
const channel = require("./api-channel.js");

module.exports = {
    moduleInfo,
    channel: channel,
}