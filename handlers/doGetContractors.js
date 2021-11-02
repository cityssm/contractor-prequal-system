import { getContractors } from "../helpers/prequalDB/getContractors.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const formFilters = request.body;
    const queryFilters = {};
    if (formFilters.contractorName !== "") {
        queryFilters.contractorName = formFilters.contractorName;
    }
    if (formFilters.hireStatus !== "") {
        queryFilters.hireStatus = formFilters.hireStatus;
    }
    if (formFilters.tradeCategoryID !== "") {
        queryFilters.tradeCategoryID = Number.parseInt(formFilters.tradeCategoryID, 10);
    }
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
