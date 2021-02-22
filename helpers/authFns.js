"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const configFns = require("./configFns");
const adWebAuth = require("@cityssm/ad-web-auth-connector");
const adWebAuthConfig = configFns.getProperty("adWebAuthConfig");
const userDomain = configFns.getProperty("application.userDomain");
adWebAuth.setConfig(adWebAuthConfig);
const authenticate = async (userName, password) => {
    return await adWebAuth.authenticate(userDomain + "\\" + userName, password);
};
exports.authenticate = authenticate;
