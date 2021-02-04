import { updateLegal, LegalForm } from "../helpers/prequalDB/updateLegal";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: LegalForm = req.body;

  const success = await updateLegal(updateForm, req.session);

  return res.json({
    success
  });
};
