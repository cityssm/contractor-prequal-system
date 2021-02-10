import { updateLegal, LegalForm } from "../helpers/prequalDB/updateLegal";

import * as resultsCache from "../helpers/queryResultsCache";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: LegalForm = req.body;

  const success = await updateLegal(updateForm, req.session);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};
