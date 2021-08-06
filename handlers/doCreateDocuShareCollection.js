import { getContractor } from "../helpers/prequalDB/getContractor.js";
import { updateContractor } from "../helpers/prequalDB/updateContractor.js";
import * as ds from "@cityssm/docushare";
import * as configFunctions from "../helpers/configFunctions.js";
import * as docuShareFunctions from "../helpers/docuShareFunctions.js";
import { clearCache } from "../helpers/queryResultsCache.js";
docuShareFunctions.doSetup();
export const handler = async (request, response) => {
    const formParameters = request.body;
    const contractor = await getContractor(formParameters.contractorID);
    if (!contractor) {
        return response.json({
            success: false,
            message: "Contractor record not found."
        });
    }
    const contractorPrequalCollectionHandle = configFunctions.getProperty("docuShareConfig.contractorPrequalCollectionHandle");
    const newCollection = await ds.createCollection(contractorPrequalCollectionHandle, contractor.contractor_name);
    if (!newCollection || !newCollection.success) {
        return response.json({
            success: false,
            message: "An error occurred communicating with DocuShare.  Please try again."
        });
    }
    const docuShareCollectionID = docuShareFunctions.getIDFromHandle(newCollection.dsObjects[0].handle);
    const success = await updateContractor({
        contractorID: contractor.contractorID,
        docuShareCollectionID
    });
    if (success) {
        clearCache();
    }
    return response.json({
        success,
        docuShareCollectionID
    });
};
export default handler;
