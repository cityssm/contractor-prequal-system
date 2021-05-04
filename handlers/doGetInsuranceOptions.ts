import { getDistinctInsuranceCompanyNames } from "../helpers/prequalDB/getDistinctInsuranceCompanyNames.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_req, res) => {

  const insuranceCompanyNames = await getDistinctInsuranceCompanyNames();

  return res.json({
    insuranceCompanyNames
  });
};
