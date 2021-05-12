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
configFallbackValues.set("permissions.canUpdate", []);
export function getProperty(propertyName) {
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
