"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocuShareCollectionURL = void 0;
const configFns = require("./configFns");
const getDocuShareCollectionURL = (collectionID) => {
    return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/Collection-" + collectionID.toString();
};
exports.getDocuShareCollectionURL = getDocuShareCollectionURL;
