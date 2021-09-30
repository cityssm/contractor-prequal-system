import { config } from "../data/config.js";
Object.freeze(config);
const configOverrides = {};
const configFallbackValues = new Map();
configFallbackValues.set("application.httpPort", 55556);
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
configFallbackValues.set("satisfactoryCriteria.legal.criteriaAlias", "Legal");
configFallbackValues.set("permissions.canUpdate", []);
export function getProperty(propertyName) {
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
