// Define this object's info
const moduleInfo = {};
moduleInfo.name = "HTTP Handlers";
moduleInfo.description = "This module handles the HTTP GET and POST requests of Open360";

// HOME PAGES RESPONSES
const httphome = require('./httphome.js');

// CHANNEL PAGES RESPONSES
const httpchannel = require('./httpchannel.js');

// ALGORITHM RESPONSES
const httpalgo = require('./httpalgo.js');

// AUTHENTICATION RESPONSES
const httpauth = require('./httpauth.js');

// DASHBOARD RESPONSES
const httpdashboard = require('./httpdashboard.js');

module.exports = {
    moduleInfo,
    home:       httphome,
    channel:    httpchannel,
    algo:       httpalgo,
    auth:       httpauth,
    dashboard : httpdashboard
}