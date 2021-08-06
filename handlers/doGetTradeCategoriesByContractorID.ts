import { getTradeCategoriesByContractorID } from "../helpers/prequalDB/getTradeCategoriesByContractorID.js";

import type { RequestHandler } from "express";


interface FormFilters {
  contractorID: string;
}


export const handler: RequestHandler = async (request, response) => {

  const formFilters: FormFilters = request.body;

  const tradeCategories = await getTradeCategoriesByContractorID(formFilters.contractorID);

  return response.json({
    tradeCategories
  });
};


export default handler;
