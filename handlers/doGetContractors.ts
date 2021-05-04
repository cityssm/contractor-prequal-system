import { getContractors, GetContractorFilters } from "../helpers/prequalDB/getContractors.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


interface FormFilters {
  contractorName: string;
  tradeCategoryID: string;
  hireStatus: "hireReady" | "cityApproved" | "";
};


export const handler: RequestHandler = async (req, res) => {

  const formFilters: FormFilters = req.body;

  const queryFilters: GetContractorFilters = {};

  if (formFilters.contractorName !== "") {
    queryFilters.contractorName = formFilters.contractorName;
  }

  switch (formFilters.hireStatus) {

    case "hireReady":
      queryFilters.isContractor = true;
      queryFilters.wsibIsSatisfactory = true;
      queryFilters.insuranceIsSatisfactory = true;
      queryFilters.healthSafetyIsSatisfactory = true;
      queryFilters.legalIsSatisfactory = true;
      break;

    case "cityApproved":
      queryFilters.isContractor = true;
      queryFilters.healthSafetyIsSatisfactory = true;
      queryFilters.legalIsSatisfactory = true;
      break;

  }

  if (formFilters.tradeCategoryID !== "") {
    queryFilters.tradeCategoryID = parseInt(formFilters.tradeCategoryID, 10);
  }

  // Read only users can see those that haven't been approved by legal and health and safety
  if (!req.session.user.canUpdate) {
    queryFilters.healthSafetyIsSatisfactory = true;
    queryFilters.legalIsSatisfactory = true;
  }

  let contractors = resultsCache.getCachedResult(req.session.user.canUpdate, queryFilters);

  if (!contractors) {
    contractors = await getContractors(req.session.user.canUpdate, queryFilters);
    resultsCache.cacheResult(req.session.user.canUpdate, queryFilters, contractors);
  }

  return res.json({
    contractors
  });
};
