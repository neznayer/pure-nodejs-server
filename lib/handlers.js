/*
 * Request handlers
 *
 */

//Dependencies
const helpers = require("./helpers");
const _data = require("./data");

// Define handlers
const handlers = {};

//Ping handler
handlers.ping = function (data, callback) {
    callback(200);
};

//Not Found Handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Users

handlers.users = function (data, callback) {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        //if data.method exists in acceptableMethods array
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};
handlers._users = {};

//Users - post
// Required data: First name, Last name, phone, email, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length === 10
            ? data.payload.phone.trim()
            : false;
    const password =
        typeof data.payload.password === "string" &&
        data.payload.password.length > 0
            ? data.payload.password
            : false;
    const tosAgreement =
        typeof data.payload.tosAgreement === "boolean" &&
        data.payload.tosAgreement === true
            ? true
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Check if that user already exists:
        _data.read("users", phone, function (err, data) {
            if (err) {
                // if error then file does not exist, create that file
                // Hash the password:
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    //Create user object
                    const user = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement,
                    };

                    //Save user to disk:
                    _data.create("users", phone, user, function (err) {
                        if (err) {
                            console.log("Error saving file ");
                            callback(500, { Error: "Can't save the file" });
                        } else {
                            callback(200, {});
                        }
                    });
                } else {
                    callback(500, { Error: "Could not hash the password" });
                }
            } else {
                callback(400, { Error: "User already exists" });
            }
        });
    } else {
        callback(400, {
            Error: "Not all fields are presented or some of it does not meet requirements ",
        });
    }
};

//Users - get
// Required data: phone
// Optional data: none
//@TODO only let an authenticated user  accsess their object, dont let them access anyone else's
handlers._users.get = function (data, callback) {
    // Check if phone number is valid:
    const phone =
        typeof data.queryStringObject.phone === "string" &&
        data.queryStringObject.phone.trim().length === 10
            ? data.queryStringObject.phone.trim()
            : false;

    if (phone) {
        _data.read("users", phone, function (err, data) {
            if (!err && data) {
                //Remove hashed password from data before returning it
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404, { Error: "User not found" });
            }
        });
    } else {
        callback(400, { Error: "Wrong phone number" });
    }
};

//Users - put
//Required data: phone,
//Optional data: firstName, lastName, password, tosAgreement
//@TODO Users can only update their own objects
handlers._users.put = function (data, callback) {
    //Check required field:
    const phone =
        typeof data.payload.phone === "string" &&
        data.payload.phone.trim().length === 10
            ? data.payload.phone.trim()
            : false;

    const firstName =
        typeof data.payload.firstName === "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    const lastName =
        typeof data.payload.lastName === "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;

    const password =
        typeof data.payload.password === "string" &&
        data.payload.password.length > 0
            ? data.payload.password
            : false;

    if (firstName || lastName || password) {
        //Lookup the user
        _data.read("users", phone, function (err, userData) {
            if (!err && oldData) {
                // Fill updated fields
                if (firstName) {
                    userData.firstName = firstName;
                }
                if (lastName) {
                    userData.lastName = lastName;
                }
                if (password) {
                    userData.hashedPassword = helpers.hash(password);
                }

                //Store data
                _data.update("users", phone, userData, function (err) {
                    if (err) {
                        console.log(err);
                        callback(500, { Error: "Error updating user" });
                    } else {
                        callback(200);
                    }
                });
            } else {
                callback(400, { Error: "Cant find the file" });
            }
        });
    }
};

//Users - delete
handlers._users.delete = function (callback) {};

module.exports = handlers;
