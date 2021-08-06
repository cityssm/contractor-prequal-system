import path from "path";

import * as ds from "@cityssm/docushare";

import * as configFunctions from "./configFunctions.js";


export const doSetup = (): void => {

  ds.setupJava({
    dsapiPath: [
      path.join("java", "dsapi.jar"),
      path.join("..", "java", "dsapi.jar"),
      path.join("..", "..", "java", "dsapi.jar"),
      path.join("..", "..", "..", "java", "dsapi.jar")
    ]
  });

  ds.setupServer(configFunctions.getProperty("docuShareConfig.server"));

  ds.setupSession(configFunctions.getProperty("docuShareConfig.session"));
};


export const getCollectionHandle = (collectionID: number): string => {
  return "Collection-" + collectionID.toString();
};


export const getCollectionURL = (collectionID: number): string => {
  return configFunctions.getProperty("docuShareConfig.rootURL") + "/dsweb/View/" +
    getCollectionHandle(collectionID);
};


export const getIDFromHandle = (handle: string): string => {
  return handle.split("-")[1];
};
