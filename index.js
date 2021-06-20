/*
 * Primary file for APK
 *
 *
 */

//Dependencies

const http = require("http");
const https = require("https");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const config = require("./lib/config");
const fs = require("fs");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

function getProtocol(req) {
    var proto = req.socket.encrypted ? "https" : "http";
    // only do this if you trust the proxy
    proto = req.headers["x-forwarded-proto"] || proto;
    return proto.split(/\s*,\s*/)[0];
}
// Instantiate http server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// start http server
httpServer.listen(config.httpPort, () =>
    console.log(
        `The server is listening on port ${config.httpPort} in ${config.envName}`
    )
);

// Instantiate https server
const httpsServerOptions = {
    key: fs.readFileSync("./https/key.pem"),
    cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) =>
    unifiedServer(req, res)
);

// Start https server
httpsServer.listen(config.httpsPort, () =>
    console.log(
        `The server is listening on port ${config.httpsPort} in ${config.envName}`
    )
);

// Create unified server http/ https would be using that:
const unifiedServer = function (req, res) {
    //Get the URL and parse it
    URLstring = getProtocol(req) + "://" + req.headers.host + req.url;
    const parsedURL = new url.URL(URLstring);

    // Get http method:
    const method = req.method.toLowerCase();

    // Get query string as objest:
    const queryStringObject = Object.fromEntries(
        parsedURL.searchParams.entries()
    );

    //
    const trimmedPath = parsedURL.pathname.replace(/^\/+|\/+$/g, "");

    //Get the headers as an object
    const headers = req.headers;

    // get the payload is there is any:
    const decoder = new StringDecoder("utf-8");
    let buffer = "";
    req.on("data", (data) => {
        // grab piece of data stream if payload is loading
        buffer += decoder.write(data);
    });
    req.on("end", () => {
        // anyway, on the end of request, do this:
        buffer += decoder.end();

        const chosenHandler = router[trimmedPath]
            ? router[trimmedPath]
            : handlers.notFound;

        const data = {
            trimmedPath,
            queryStringObject,
            headers,
            method,
            payload: helpers.parseJSONtoObject(buffer),
        };

        chosenHandler(data, (statusCode, payload) => {
            // initialise status code with 200 if it not a number
            statusCode = typeof statusCode === "number" ? statusCode : 200;
            // if there is no payload, init it with  {}
            payload = typeof payload === "object" ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode); // write status code to response
            res.end(payloadString);
            console.log(`returning this response: `, statusCode, payloadString);
        });
    });
};

// router: which path will be doing what
const router = {
    sample: handlers.sample,
    users: handlers.users,
};
