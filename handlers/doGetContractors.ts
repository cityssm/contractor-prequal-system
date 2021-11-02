import { getContractors, GetContractorFilters } from "../helpers/prequalDB/getContractors.js";

import * as resultsCache from "../helpers/queryResultsCache.js";

import type { RequestHandler } from "express";


interface FormFilters {
  contractorName: string;
  tradeCategoryID: string;
  hireStatus: "hireReady" | "cityApproved" | "partiallyApproved" | "";
}


export const handler: RequestHandler = async (request, response) => {

  const formFilters: FormFilters = request.body;

  const queryFilters: GetContractorFilters = {};

  if (formFilters.contractorName !== "") {
    queryFilters.contractorName = formFilters.contractorName;
  }

  if (formFilters.hireStatus !== "") {
    queryFilters.hireStatus = formFilters.hireStatus;
  }

  if (formFilters.tradeCategoryID !== "") {
    queryFilters.tradeCategoryID = Number.parseInt(formFilters.tradeCategoryID, 10);
  }

  // Read only users can see those that haven't been approved by legal and health and safety
  if (!request.session.user.canUpdate && formFilters.hireStatus === "") {
    queryFilters.hireStatus = "partiallyApproved";
  }

  let contractors = resultsCache.getCachedResult(request.session.user.canUpdate, queryFilters);

  if (!contractors) {
    contractors = await getContractors(request.session.user.canUpdate, queryFilters);
    resultsCache.cacheResult(request.session.user.canUpdate, queryFilters, contractors);
  }

  return response.json({
    contractors
  });
};


export default handler;
