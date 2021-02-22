#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require("../app");
const http = require("http");
const https = require("https");
const fs = require("fs");
const child_process_1 = require("child_process");
const configFns = require("../helpers/configFns");
const debug_1 = require("debug");
const debugWWW = debug_1.debug("contractor-prequal-system:www");
const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            debugWWW("Requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            debugWWW("Port is already in use.");
            process.exit(1);
        default:
            throw error;
    }
};
const onListening = (server) => {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port.toString();
    debugWWW("Listening on " + bind);
};
const httpPort = configFns.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", function () {
        onListening(httpServer);
    });
    debugWWW("HTTP listening on " + httpPort.toString());
}
const httpsConfig = configFns.getProperty("application.https");
if (httpsConfig) {
    const httpsServer = https.createServer({
        key: fs.readFileSync(httpsConfig.keyPath),
        cert: fs.readFileSync(httpsConfig.certPath),
        passphrase: httpsConfig.passphrase
    }, app);
    httpsServer.listen(httpsConfig.port);
    httpsServer.on("error", onError);
    httpsServer.on("listening", function () {
        onListening(httpsServer);
    });
    debugWWW("HTTPS listening on " + httpsConfig.port.toString());
}
child_process_1.fork("./tasks/clearRiskInsuranceImport");
child_process_1.fork("./tasks/docuShareSync");
child_process_1.fork("./tasks/wsibRefresh");
