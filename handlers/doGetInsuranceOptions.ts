import { getDistinctInsuranceCompanyNames } from "../helpers/prequalDB/getDistinctInsuranceCompanyNames";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_req, res) => {

  const insuranceCompanyNames = await getDistinctInsuranceCompanyNames();

  return res.json({
    insuranceCompanyNames
  });
};
