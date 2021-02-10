import { removeTradeCategory } from "../helpers/prequalDB/removeTradeCategory";

import * as resultsCache from "../helpers/queryResultsCache";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const formParams: {
    contractorID: string;
    tradeCategoryID: string;
  } = req.body;

  const success = await removeTradeCategory(formParams.contractorID, formParams.tradeCategoryID);

  if (success) {
    resultsCache.clearCache();
  }

  return res.json({
    success
  });
};
