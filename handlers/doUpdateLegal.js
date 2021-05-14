import { updateLegal } from "../helpers/prequalDB/updateLegal.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateLegal(updateForm, req.session);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
export default handler;
