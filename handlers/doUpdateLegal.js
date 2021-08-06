import { updateLegal } from "../helpers/prequalDB/updateLegal.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const updateForm = request.body;
    const success = await updateLegal(updateForm, request.session);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
