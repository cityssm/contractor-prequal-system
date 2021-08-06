import { getDistinctInsuranceCompanyNames } from "../helpers/prequalDB/getDistinctInsuranceCompanyNames.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_request, response) => {

  const insuranceCompanyNames = await getDistinctInsuranceCompanyNames();

  return response.json({
    insuranceCompanyNames
  });
};


export default handler;
