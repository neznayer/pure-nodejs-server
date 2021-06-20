// Create and export configuration variables:

//Container for all environments:
const environments = {};

// Staging environment

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "staging",
    hashingSecret: "thisIsAsecret",
};

// Production object:

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashingSecret: "thisIsAlsoisAsecret",
};

//Determine what environment was passed to command line:

const currentEnv =
    typeof process.env.NODE_ENV === "string"
        ? process.env.NODE_ENV.toLowerCase()
        : "";

// Check if current environment is one of the defined environments

const envToExport =
    typeof environments[currentEnv] === "object"
        ? environments[currentEnv]
        : environments.staging;

module.exports = envToExport;
