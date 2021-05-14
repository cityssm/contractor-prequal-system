import getTradeCategoriesByContractorID from "../helpers/prequalDB/getTradeCategoriesByContractorID.js";

import type { RequestHandler } from "express";


interface FormFilters {
  contractorID: string;
};


export const handler: RequestHandler = async (req, res) => {

  const formFilters: FormFilters = req.body;

  const tradeCategories = await getTradeCategoriesByContractorID(formFilters.contractorID);

  return res.json({
    tradeCategories
  });
};


export default handler;
