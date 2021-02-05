import * as configFns from "./configFns";


export const getDocuShareCollectionURL = (collectionID: number) => {

  return configFns.getProperty("docuShareConfig.rootURL") + "/dsweb/View/Collection-" + collectionID.toString();
};
