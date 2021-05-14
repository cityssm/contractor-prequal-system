import { updateContractor, ContractorForm } from "../helpers/prequalDB/updateContractor.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: ContractorForm = req.body;

  const success = await updateContractor(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};


export default handler;
