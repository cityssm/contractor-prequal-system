import { getTradeCategories } from "../helpers/prequalDB/getTradeCategories";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_req, res) => {

  const tradeCategories = await getTradeCategories(false);

  return res.json({
    tradeCategories
  });
};
