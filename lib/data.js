/*
 * Library fir storing and editing data
 *
 */

//Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

//Container foir the module to be exported

const lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

//Write data to a file
lib.create = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "wx",
        function (err, fileD) {
            if (!err && fileD) {
                // Convert data to string
                const stringData = JSON.stringify(data);
                // Write to file and close it
                fs.writeFile(fileD, stringData, function (err) {
                    if (!err) {
                        fs.close(fileD, function (err) {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error closing new file");
                            }
                        });
                    } else {
                        callback("Could not write to file");
                    }
                });
            } else {
                callback(
                    "Could not create file, it may already exist or path is not right"
                );
            }
        }
    );
};

//Read data from file

lib.read = function (dir, file, callback) {
    fs.readFile(
        lib.baseDir + dir + "/" + file + ".json",
        "utf8",
        function (err, data) {
            if (!err && data) {
                const parsedData = helpers.parseJSONtoObject(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        }
    );
};

//Update existing file
lib.update = function (dir, file, data, callback) {
    //Oper the file for writing
    fs.open(
        lib.baseDir + dir + "/" + file + ".json",
        "r+",
        function (err, fileD) {
            if (!err && fileD) {
                const stringData = JSON.stringify(data);

                fs.ftruncate(fileD, function (err) {
                    if (!err) {
                        fs.writeFile(fileD, stringData, function (err) {
                            if (!err) {
                                fs.close(fileD, function (err) {
                                    if (err) {
                                        callback("Error closing file");
                                    } else {
                                        callback(false);
                                    }
                                });
                            } else {
                                callback("Error with writing the file");
                            }
                        });
                    } else {
                        callback("Error truncating file");
                    }
                });
            } else {
                callback(`Could not open ${file}, it might be not existing`);
            }
        }
    );
};

//Deleting a file

lib.delete = function (dir, file, callback) {
    // Unlink
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};
module.exports = lib;
