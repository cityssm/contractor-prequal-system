import { updateInsurance } from "../helpers/prequalDB/updateInsurance.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateInsurance(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
