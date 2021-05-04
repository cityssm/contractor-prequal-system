import * as path from "path";
import * as ds from "@cityssm/docushare";
import * as configFns from "./configFns.js";
export const doSetup = () => {
    ds.setupJava({
        dsapiPath: path.join("..", "..", "..", "java", "dsapi.jar")
    });
    ds.setupServer(configFns.getProperty("docuShareConfig.server"));
    ds.setupSession(configFns.getProperty("docuShareConfig.session"));
};
export const getCollectionHandle = (collectionID) => {
    return "Collection-" + collectionID.toString();
};
export const getCollectionURL = (collectionID) => {
    return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/" +
        getCollectionHandle(collectionID);
};
export const getIDFromHandle = (handle) => {
    return handle.split("-")[1];
};
