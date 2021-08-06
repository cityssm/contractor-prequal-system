import { updateWSIB, WSIBForm } from "../helpers/prequalDB/updateWSIB.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const updateForm: WSIBForm = request.body;

  const success = await updateWSIB(updateForm);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
