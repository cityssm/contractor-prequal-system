import { getContractors, GetContractorFilters } from "../helpers/prequalDB/getContractors";

import type { RequestHandler } from "express";


interface FormFilters {

};


export const handler: RequestHandler = async (req, res) => {

  const formFilters: FormFilters = req.body;

  const queryFilters: GetContractorFilters = {};

  if (!req.session.user.canUpdate) {
    queryFilters.isContractor = true;
    queryFilters.wsibIsSatisfactory = true;
    queryFilters.insuranceIsSatisfactory = true;
    queryFilters.healthSafetyIsSatisfactory = true;
    queryFilters.legalIsSatisfactory = true;
  }

  const contractors = await getContractors(queryFilters);

  return res.json({
    contractors
  });
};
