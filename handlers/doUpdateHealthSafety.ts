import { updateHealthSafety, HealthSafetyForm } from "../helpers/prequalDB/updateHealthSafety";

import * as resultsCache from "../helpers/queryResultsCache";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: HealthSafetyForm = req.body;

  const success = await updateHealthSafety(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};
