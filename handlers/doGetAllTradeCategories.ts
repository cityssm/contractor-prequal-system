import { getTradeCategories } from "../helpers/prequalDB/getTradeCategories.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_request, response) => {

  const tradeCategories = await getTradeCategories(false);

  return response.json({
    tradeCategories
  });
};


export default handler;
