"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIDFromHandle = exports.getCollectionURL = exports.getCollectionHandle = exports.doSetup = void 0;
const path = require("path");
const ds = require("@cityssm/docushare");
const configFns = require("./configFns");
const doSetup = () => {
    ds.setupJava({
        dsapiPath: path.join("..", "..", "..", "java", "dsapi.jar")
    });
    ds.setupServer(configFns.getProperty("docuShareConfig.server"));
    ds.setupSession(configFns.getProperty("docuShareConfig.session"));
};
exports.doSetup = doSetup;
const getCollectionHandle = (collectionID) => {
    return "Collection-" + collectionID.toString();
};
exports.getCollectionHandle = getCollectionHandle;
const getCollectionURL = (collectionID) => {
    return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/" +
        exports.getCollectionHandle(collectionID);
};
exports.getCollectionURL = getCollectionURL;
const getIDFromHandle = (handle) => {
    return handle.split("-")[1];
};
exports.getIDFromHandle = getIDFromHandle;
