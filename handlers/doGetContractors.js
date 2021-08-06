import { getContractors } from "../helpers/prequalDB/getContractors.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const formFilters = request.body;
    const queryFilters = {};
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
        queryFilters.tradeCategoryID = Number.parseInt(formFilters.tradeCategoryID, 10);
    }
    if (!request.session.user.canUpdate) {
        queryFilters.healthSafetyIsSatisfactory = true;
        queryFilters.legalIsSatisfactory = true;
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
