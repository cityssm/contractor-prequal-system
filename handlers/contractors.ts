import getTradeCategories from "../helpers/prequalDB/getTradeCategories.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const tradeCategories = await getTradeCategories(!req.session.user.canUpdate);

  res.render("contractors", {
    tradeCategories
  });
};


export default handler;
