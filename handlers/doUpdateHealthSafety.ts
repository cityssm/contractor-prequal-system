import { updateHealthSafety, HealthSafetyForm } from "../helpers/prequalDB/updateHealthSafety";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: HealthSafetyForm = req.body;

  const success = await updateHealthSafety(updateForm);

  return res.json({
    success
  });
};
