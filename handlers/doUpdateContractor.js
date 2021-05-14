import { updateContractor } from "../helpers/prequalDB/updateContractor.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateContractor(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
export default handler;
