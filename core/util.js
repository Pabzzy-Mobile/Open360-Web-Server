/**
 * Contains all utility types and methods
 * @type {Object}
 */
let Util = {};

/**
 * @summary Data pertaining to a user's info.
 * This data can be 4 different types:
 * - **ALL_INFO** - Which includes all the variables of UserData
 * - **JUST_AUTH** - Which includes only `userId`, `email`, `active`, `password` and `salt`
 * - **JUST_DETAILS** - Which includes only `userId`, `email`, `displayName` and `subscriptions`
 * - **JUST_HASH** - Which includes only the `salt`
 * @constructor - Creates an empty User object
 */
Util.UserData = function (){
    /**  Defines what type this userdata
     * @type {Util.UserDataTypes} */
    this.type = Util.UserDataTypes.ALL_INFO;
    /** User account is activated
     * @type {boolean} */
    this.active = true;
    /** User Id
     * @type {string} */
    this.userId = "";
    /** Username
     * @type {string} */
    this.username = "";
    /** E-mail
     * @type {string} */
    this.email = "";
    /** Hashed password
     * @type {string} */
    this.password = "";
    /** The salt for the password hashing
     * @type {string} */
    this.salt = "";
    /** Display name of the user
     * @type {string} */
    this.displayName = "";
    /** Array describing the current subscriptions of the user
     * TODO: CREATE A PROTOTYPE FOR THIS
     * @type {*[]} */
    this.subscriptions = [];
    /** Convert object to the userData type
     * @param obj
     * @return Util.UserData */
    this.cast = function (obj) {
        obj && Object.assign(this, obj);
        return this;
    }
}

/**
 * Datatype of a UserData
 * @type {{JUST_HASH: number, JUST_AUTH: number, JUST_DETAILS: number, ALL_INFO: number}}
 */
Util.UserDataTypes = {
    /**
     * All the variables of UserData
     */
    "ALL_INFO": 0,
    /**
     * Only userId, email, password and salt
     */
    "JUST_AUTH": 1,
    /**
     * Only userId, email, displayName and subscriptions
     */
    "JUST_DETAILS": 2,
    /**
     * Only the salt
     */
    "JUST_HASH": 3
}

module.exports = Util;