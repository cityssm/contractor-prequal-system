import { updateWSIB } from "../helpers/prequalDB/updateWSIB.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateWSIB(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
export default handler;
