import { getContractors, GetContractorFilters } from "../helpers/prequalDB/getContractors";

import type { RequestHandler } from "express";


interface FormFilters {
  contractorName: string;
  tradeCategoryID: string;
  isHireReady?: "1";
};


export const handler: RequestHandler = async (req, res) => {

  const formFilters: FormFilters = req.body;

  const queryFilters: GetContractorFilters = {};

  if (formFilters.contractorName !== "") {
    queryFilters.contractorName = formFilters.contractorName;
  }

  if (!req.session.user.canUpdate || formFilters.isHireReady === "1") {
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
