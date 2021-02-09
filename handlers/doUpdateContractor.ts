import { updateContractor, ContractorForm } from "../helpers/prequalDB/updateContractor";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: ContractorForm = req.body;

  const success = await updateContractor(updateForm);

  return res.json({
    success
  });
};
