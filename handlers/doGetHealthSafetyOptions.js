import { getHealthSafetyStatusOptions } from "../helpers/prequalDB/getHealthSafetyStatusOptions.js";
export const handler = async (_req, res) => {
    const healthSafetyStatuses = await getHealthSafetyStatusOptions();
    return res.json({
        healthSafetyStatuses
    });
};
