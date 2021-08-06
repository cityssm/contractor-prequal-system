import { updateContractor, ContractorForm } from "../helpers/prequalDB/updateContractor.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const updateForm: ContractorForm = request.body;

  const success = await updateContractor(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
