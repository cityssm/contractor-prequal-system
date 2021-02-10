import { updateInsurance, InsuranceForm } from "../helpers/prequalDB/updateInsurance";

import * as resultsCache from "../helpers/queryResultsCache";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: InsuranceForm = req.body;

  const success = await updateInsurance(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};
