import { removeTradeCategory } from "../helpers/prequalDB/removeTradeCategory.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const formParameters = request.body;
    const success = await removeTradeCategory(formParameters.contractorID, formParameters.tradeCategoryID);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
