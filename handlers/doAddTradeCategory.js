import { addTradeCategory } from "../helpers/prequalDB/addTradeCategory.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const formParameters = request.body;
    const success = await addTradeCategory(formParameters.contractorID, formParameters.tradeCategoryID);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
