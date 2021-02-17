"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionURL = exports.getCollectionHandle = void 0;
const configFns = require("./configFns");
const getCollectionHandle = (collectionID) => {
    return "Collection-" + collectionID.toString();
};
exports.getCollectionHandle = getCollectionHandle;
const getCollectionURL = (collectionID) => {
    return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/" +
        exports.getCollectionHandle(collectionID);
};
exports.getCollectionURL = getCollectionURL;
