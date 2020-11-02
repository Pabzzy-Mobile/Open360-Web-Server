// Require the crypto module
const crypto = require("crypto");

/**
 * @type UserData
 * @property {UserDataTypes} type - Defines what type this userdata
 * @property {boolean} active - User account is activated
 * @property {string} userId - Unique identifier of the user account
 * @property {string} username - Username
 * @property {string} email - Email
 * @property {string} password - Hashed password
 * @property {string} salt - Salt for password hashing
 * @property {string} displayName - Display Name
 * @property {*[]} subscriptions - Subs
 */
class UserData {
    /**
     * @summary Data pertaining to a user's info.
     * This data can be 4 different types:
     * - **ALL_INFO** - Which includes all the variables of UserData
     * - **JUST_AUTH** - Which includes only `userId`, `email`, `active`, `password` and `salt`
     * - **JUST_DETAILS** - Which includes only `userId`, `email`, `displayName` and `subscriptions`
     * - **JUST_HASH** - Which includes only the `salt`
     * @constructor - Creates an empty User object
     */
    constructor() {
        this.type = UserDataTypes.ALL_INFO;
        this.active = true;
        this.userId = "";
        this.username = "";
        this.email = "";
        this.password = "";
        this.salt = "";
        this.displayName = "";
        this.subscriptions = [];
    }

    cast(obj) {
        obj && Object.assign(this, obj);
        return this;
    }

    empty() {
        return this.userId === "" && this.username === "" && this.email === "" && this.password === "" && this.salt === "" && this.displayName === "" && this.subscriptions === [];
    }
}

/**
 * Datatype of a UserData
 * @const UserDataTypes
 * @property {number} ALL_INFO - All the variables of UserData
 * @property {number} JUST_AUTH - Only userId, email, password and salt
 * @property {number} JUST_DETAILS - Only userId, email, displayName and subscriptions
 * @property {number} JUST_HASH - Only the salt
 */
const UserDataTypes = {
    "ALL_INFO": 0,
    "JUST_AUTH": 1,
    "JUST_DETAILS": 2,
    "JUST_HASH": 3
}

/**
 * Salts a password, if no salt is passed it'll generate a new one
 * @param password {string}
 * @param [salt] {string}
 * @return {{password: string, salt: string}}
 */
function saltPassword(password, salt){
    if (salt == null){
        // Generate the salt
        salt = generateString(8);
    }
    // Set the hash
    let hash = crypto.createHash('sha256');
    // Hash the password and salt it
    let hashedPassword = hash.update(password + salt).digest('hex');
    // Return the password and the salt
    return {password: hashedPassword, salt: salt};
}

/**
 * Generates a random string of characters
 * @param length
 * @return {string}
 */
function generateString(length){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * @const NotAllowedUsernames - An array with the not allowed usernames
 * @type {string[]}
 */
const NotAllowedUsernames = [
    "login",
    "register",
    "auth",
    "public"
]

module.exports = {
    UserData,
    UserDataTypes,
    saltPassword,
    generateString,
    NotAllowedUsernames
};