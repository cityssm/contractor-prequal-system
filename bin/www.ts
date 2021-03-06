#!/usr/bin/env node

import app from "../app.js";

import http from "http";
import https from "https";
import fs from "fs";

import { fork } from "child_process";

import * as configFns from "../helpers/configFns.js";

import debug from "debug";
const debugWWW = debug("contractor-prequal-system:www");


const onError = (error: Error) => {

  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      debugWWW("Requires elevated privileges");
      process.exit(1);
    // break;

    case "EADDRINUSE":
      debugWWW("Port is already in use.");
      process.exit(1);
    // break;

    default:
      throw error;
  }
};

const onListening = (server: http.Server | https.Server) => {

  const addr = server.address();

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port.toString();

  debugWWW("Listening on " + bind);
};


/**
 * Initialize HTTP
 */


const httpPort = configFns.getProperty("application.httpPort");

if (httpPort) {

  const httpServer = http.createServer(app);

  httpServer.listen(httpPort);

  httpServer.on("error", onError);
  httpServer.on("listening", function() {
    onListening(httpServer);
  });

  debugWWW("HTTP listening on " + httpPort.toString());
}


/**
 * Initialize HTTPS
 */


const httpsConfig = configFns.getProperty("application.https");

if (httpsConfig) {

  const httpsServer = https.createServer({
    key: fs.readFileSync(httpsConfig.keyPath),
    cert: fs.readFileSync(httpsConfig.certPath),
    passphrase: httpsConfig.passphrase
  }, app);

  httpsServer.listen(httpsConfig.port);

  httpsServer.on("error", onError);

  httpsServer.on("listening", function() {
    onListening(httpsServer);
  });

  debugWWW("HTTPS listening on " + httpsConfig.port.toString());
}


/*
 * Initialize background tasks
 */

fork("./tasks/clearRiskInsuranceImport");
fork("./tasks/docuShareSync");
fork("./tasks/wsibRefresh");
