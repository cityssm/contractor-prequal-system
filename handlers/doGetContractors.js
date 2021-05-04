import { getContractors } from "../helpers/prequalDB/getContractors.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
;
export const handler = async (req, res) => {
    const formFilters = req.body;
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
        queryFilters.tradeCategoryID = parseInt(formFilters.tradeCategoryID, 10);
    }
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
