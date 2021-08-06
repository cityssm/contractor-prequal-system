import type * as configTypes from "../types/configTypes";
import type * as dsTypes from "@cityssm/docushare/types";
import type * as sqlTypes from "mssql";
import type { ADWebAuthConfig } from "@cityssm/ad-web-auth-connector/types";


/*
 * LOAD CONFIGURATION
 */

// eslint-disable-next-line node/no-unpublished-import
import { config } from "../data/config.js";

Object.freeze(config);


/*
 * SET UP FALLBACK VALUES
 */


const configOverrides: { [propertyName: string]: unknown } = {};

const configFallbackValues = new Map<string, unknown>();

configFallbackValues.set("application.httpPort", 55_556);

configFallbackValues.set("reverseProxy.disableCompression", false);
configFallbackValues.set("reverseProxy.disableEtag", false);
configFallbackValues.set("reverseProxy.blockViaXForwardedFor", false);
configFallbackValues.set("reverseProxy.urlPrefix", "");

configFallbackValues.set("session.cookieName", "contractor-prequal-system-user-sid");
configFallbackValues.set("session.secret", "cityssm/contractor-prequal-system");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);

configFallbackValues.set("twoFactor.isEnabledInternally", false);
configFallbackValues.set("twoFactor.isRequiredInternally", false);
configFallbackValues.set("twoFactor.isEnabledExternally", false);
configFallbackValues.set("twoFactor.isRequiredExternally", false);

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

export function getProperty(propertyName: "twoFactor.isEnabledInternally"): boolean;
export function getProperty(propertyName: "twoFactor.isRequiredInternally"): boolean;
export function getProperty(propertyName: "twoFactor.isEnabledExternally"): boolean;
export function getProperty(propertyName: "twoFactor.isRequiredExternally"): boolean;
export function getProperty(propertyName: "twoFactor.mssqlConfig"): sqlTypes.config;

export function getProperty(propertyName: "mssqlConfig"): sqlTypes.config;
export function getProperty(propertyName: "adWebAuthConfig"): ADWebAuthConfig;

export function getProperty(propertyName: "docuShareConfig.rootURL"): string;
export function getProperty(propertyName: "docuShareConfig.contractorPrequalCollectionHandle"): string;
export function getProperty(propertyName: "docuShareConfig.server"): dsTypes.ServerConfig;
export function getProperty(propertyName: "docuShareConfig.session"): dsTypes.SessionConfig;

export function getProperty(propertyName: "clearRiskConfig.insuranceImport.folderPath"): string;
export function getProperty(propertyName: "clearRiskConfig.insuranceImport.columnNames"): configTypes.Config_ClearRisk_InsuranceImport_ColumnNames;

export function getProperty(propertyName: "permissions.canUpdate"): string[];


export function getProperty(propertyName: string): unknown {

  if (Object.prototype.hasOwnProperty.call(configOverrides, propertyName)) {
    return configOverrides[propertyName];
  }

  const propertyNameSplit = propertyName.split(".");

  let currentObject = config;

  for (const element of propertyNameSplit) {

    currentObject = currentObject[element];

    if (!currentObject) {
      return configFallbackValues.get(propertyName);
    }

  }

  return currentObject;
}
