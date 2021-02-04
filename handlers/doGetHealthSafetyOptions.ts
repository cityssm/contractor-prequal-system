import { getHealthSafetyStatusOptions } from "../helpers/prequalDB/getHealthSafetyStatusOptions";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (_req, res) => {

  const healthSafetyStatuses = await getHealthSafetyStatusOptions();

  return res.json({
    healthSafetyStatuses
  });
};
