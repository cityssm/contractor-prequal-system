import * as winston from "winston";

import type * as configTypes from "../types/configTypes";
import type * as sqlTypes from "mssql";
import type { ADWebAuthConfig } from "@cityssm/ad-web-auth-connector/types";


/*
 * LOAD CONFIGURATION
 */


import config = require("../data/config");

Object.freeze(config);


/*
 * SET UP FALLBACK VALUES
 */


const configOverrides: { [propertyName: string]: any } = {};

const configFallbackValues = new Map<string, any>();

configFallbackValues.set("application.httpPort", 55556);

configFallbackValues.set("reverseProxy.disableCompression", false);
configFallbackValues.set("reverseProxy.disableEtag", false);
configFallbackValues.set("reverseProxy.blockViaXForwardedFor", false);
configFallbackValues.set("reverseProxy.urlPrefix", "");

configFallbackValues.set("session.cookieName", "contractor-prequal-system-user-sid");
configFallbackValues.set("session.secret", "cityssm/contractor-prequal-system");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);

configFallbackValues.set("permissions.canUpdate", []);


export function getProperty(propertyName: "application.httpPort"): number;
export function getProperty(propertyName: "application.https"): configTypes.Config_HTTPSConfig;
export function getProperty(propertyName: "application.userDomain"): string;

export function getProperty(propertyName: "reverseProxy.disableCompression"): boolean;
export function getProperty(propertyName: "reverseProxy.disableEtag"): boolean;
export function getProperty(propertyName: "reverseProxy.blockViaXForwardedFor"): boolean;
export function getProperty(propertyName: "reverseProxy.urlPrefix"): "";

export function getProperty(propertyName: "session.cookieName"): string;
export function getProperty(propertyName: "session.doKeepAlive"): boolean;
export function getProperty(propertyName: "session.maxAgeMillis"): number;
export function getProperty(propertyName: "session.secret"): string;

export function getProperty(propertyName: "mssqlConfig"): sqlTypes.config;
export function getProperty(propertyName: "adWebAuthConfig"): ADWebAuthConfig;

export function getProperty(propertyName: "permissions.canUpdate"): string[];


export function getProperty(propertyName: string): any {

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


/*
 * Logging
 */


export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/contractorPrequalSystem-error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/contractorPrequalSystem-combined.log" })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
