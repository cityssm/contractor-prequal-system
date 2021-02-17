import * as configFns from "./configFns";


export const getCollectionHandle = (collectionID: number) => {
  return "Collection-" + collectionID.toString();
};


export const getCollectionURL = (collectionID: number) => {
  return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/" +
    getCollectionHandle(collectionID);
};
