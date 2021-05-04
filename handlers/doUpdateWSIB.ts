import { updateWSIB, WSIBForm } from "../helpers/prequalDB/updateWSIB.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: WSIBForm = req.body;

  const success = await updateWSIB(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};
