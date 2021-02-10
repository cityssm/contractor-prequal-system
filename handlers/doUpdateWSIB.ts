import { updateWSIB, WSIBForm } from "../helpers/prequalDB/updateWSIB";

import * as resultsCache from "../helpers/queryResultsCache";

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
