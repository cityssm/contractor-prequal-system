import { getHealthSafetyStatusOptions } from "../helpers/prequalDB/getHealthSafetyStatusOptions.js";
export const handler = async (_request, response) => {
    const healthSafetyStatuses = await getHealthSafetyStatusOptions();
    return response.json({
        healthSafetyStatuses
    });
};
export default handler;
