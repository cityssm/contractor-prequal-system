import { getHealthSafetyStatusOptions } from "../helpers/prequalDB/getHealthSafetyStatusOptions.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_request, response) => {

  const healthSafetyStatuses = await getHealthSafetyStatusOptions();

  return response.json({
    healthSafetyStatuses
  });
};


export default handler;
