import { getContractor } from "../helpers/prequalDB/getContractor";
import { updateContractor } from "../helpers/prequalDB/updateContractor";

import * as ds from "@cityssm/docushare";

import * as configFns from "../helpers/configFns";
import * as docuShareFns from "../helpers/docuShareFns";

import { clearCache } from "../helpers/queryResultsCache";

import type { RequestHandler } from "express";


docuShareFns.doSetup();


export const handler: RequestHandler = async (req, res) => {

  const formParams: {
    contractorID: string;
  } = req.body;

  const contractor = await getContractor(formParams.contractorID);

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

  const success = await updateContractor({
    contractorID: contractor.contractorID,
    docuShareCollectionID
  });

  if (success) {
    clearCache();
  }

  return res.json({
    success,
    docuShareCollectionID
  });
};