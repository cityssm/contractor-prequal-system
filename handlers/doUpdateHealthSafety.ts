import { updateHealthSafety, HealthSafetyForm } from "../helpers/prequalDB/updateHealthSafety.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const updateForm: HealthSafetyForm = request.body;

  const success = await updateHealthSafety(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
