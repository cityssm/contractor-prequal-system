"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getContractor_1 = require("../helpers/prequalDB/getContractor");
const updateContractor_1 = require("../helpers/prequalDB/updateContractor");
const ds = require("@cityssm/docushare");
const configFns = require("../helpers/configFns");
const docuShareFns = require("../helpers/docuShareFns");
const queryResultsCache_1 = require("../helpers/queryResultsCache");
docuShareFns.doSetup();
const handler = async (req, res) => {
    const formParams = req.body;
    const contractor = await getContractor_1.getContractor(formParams.contractorID);
    if (!contractor) {
        return res.json({
            success: false,
            message: "Contractor record not found."
        });
    }
    const contractorPrequalCollectionHandle = configFns.getProperty("docuShareConfig.contractorPrequalCollectionHandle");
    const newCollection = await ds.createCollection(contractorPrequalCollectionHandle, contractor.contractor_name);
    if (!newCollection || !newCollection.success) {
        return res.json({
            success: false,
            message: "An error occurred communicating with DocuShare.  Please try again."
        });
    }
    const docuShareCollectionID = docuShareFns.getIDFromHandle(newCollection.dsObjects[0].handle);
    const success = await updateContractor_1.updateContractor({
        contractorID: contractor.contractorID,
        docuShareCollectionID
    });
    if (success) {
        queryResultsCache_1.clearCache();
    }
    return res.json({
        success,
        docuShareCollectionID
    });
};
exports.handler = handler;
