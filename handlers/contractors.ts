import { getTradeCategories } from "../helpers/prequalDB/getTradeCategories.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (request, response) => {

  const tradeCategories = await getTradeCategories(!request.session.user.canUpdate);

  response.render("contractors", {
    tradeCategories
  });
};


export default handler;
