/*
 * Various helper functions
 *
 */

//Dependencies

const crypto = require("crypto");
const config = require("./config");

// Container for all functions
const helpers = {};

//Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof str === "string" && str.trim().length > 0) {
        const hash = crypto
            .createHmac("sha256", config.hashingSecret)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};

// Parse JSON to object without throwing error if there isn't valid JSON

helpers.parseJSONtoObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

module.exports = helpers;
