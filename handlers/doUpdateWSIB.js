import { updateWSIB } from "../helpers/prequalDB/updateWSIB.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const updateForm = request.body;
    const success = await updateWSIB(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
