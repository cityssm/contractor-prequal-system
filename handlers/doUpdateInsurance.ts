import { updateInsurance, InsuranceForm } from "../helpers/prequalDB/updateInsurance";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: InsuranceForm = req.body;

  const success = await updateInsurance(updateForm);

  return res.json({
    success
  });
};
