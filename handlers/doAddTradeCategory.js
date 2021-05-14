import addTradeCategory from "../helpers/prequalDB/addTradeCategory.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (req, res) => {
    const formParams = req.body;
    const success = await addTradeCategory(formParams.contractorID, formParams.tradeCategoryID);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
export default handler;
