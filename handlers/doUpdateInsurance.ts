import { updateInsurance, InsuranceForm } from "../helpers/prequalDB/updateInsurance.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const updateForm: InsuranceForm = request.body;

  const success = await updateInsurance(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
