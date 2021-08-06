import { addTradeCategory } from "../helpers/prequalDB/addTradeCategory.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const formParameters: {
    contractorID: string;
    tradeCategoryID: string;
  } = request.body;

  const success = await addTradeCategory(formParameters.contractorID, formParameters.tradeCategoryID);

  if (success) {
    resultsCache.clearCache();
  }

  return response.json({
    success
  });
};


export default handler;
