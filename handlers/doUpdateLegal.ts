import { updateLegal, LegalForm } from "../helpers/prequalDB/updateLegal.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const updateForm: LegalForm = request.body;

  const success = await updateLegal(updateForm, request.session);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
