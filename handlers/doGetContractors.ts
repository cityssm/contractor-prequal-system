import { getContractors, GetContractorFilters } from "../helpers/prequalDB/getContractors";

import type { RequestHandler } from "express";


interface FormFilters {
  tradeCategoryID: string;
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

  if (formFilters.tradeCategoryID !== "") {
    queryFilters.tradeCategoryID = parseInt(formFilters.tradeCategoryID, 10);
  }

  const contractors = await getContractors(queryFilters);

  return res.json({
    contractors
  });
};
