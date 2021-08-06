import { updateContractor } from "../helpers/prequalDB/updateContractor.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const updateForm = request.body;
    const success = await updateContractor(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
