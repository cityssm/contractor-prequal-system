import { updateInsurance } from "../helpers/prequalDB/updateInsurance.js";
import * as resultsCache from "../helpers/queryResultsCache.js";
export const handler = async (request, response) => {
    const updateForm = request.body;
    const success = await updateInsurance(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return response.json({
        success
    });
};
export default handler;
