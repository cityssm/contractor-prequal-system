import { removeTradeCategory } from "../helpers/prequalDB/removeTradeCategory.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const formParameters: {
    contractorID: string;
    tradeCategoryID: string;
  } = request.body;

  const success = await removeTradeCategory(formParameters.contractorID, formParameters.tradeCategoryID);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
