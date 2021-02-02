"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.getProperty = void 0;
const winston = require("winston");
const config = require("../data/config");
Object.freeze(config);
const configOverrides = {};
const configFallbackValues = new Map();
configFallbackValues.set("application.httpPort", 55556);
configFallbackValues.set("session.cookieName", "contractor-prequal-system-user-sid");
configFallbackValues.set("session.secret", "cityssm/contractor-prequal-system");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);
configFallbackValues.set("permissions.canUpdate", []);
function getProperty(propertyName) {
    if (configOverrides.hasOwnProperty(propertyName)) {
        return configOverrides[propertyName];
    }
    const propertyNameSplit = propertyName.split(".");
    let currentObj = config;
    for (let index = 0; index < propertyNameSplit.length; index += 1) {
        currentObj = currentObj[propertyNameSplit[index]];
        if (!currentObj) {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObj;
}
exports.getProperty = getProperty;
exports.logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "contractorPrequalSystem-error.log", level: "error" }),
        new winston.transports.File({ filename: "contractorPrequalSystem-combined.log" })
    ]
});
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
