import { updateWSIB, WSIBForm } from "../helpers/prequalDB/updateWSIB";

import type { RequestHandler } from "express";


export const handler: RequestHandler = async (req, res) => {

  const updateForm: WSIBForm = req.body;

  const success = await updateWSIB(updateForm);

  return res.json({
    success
  });
};
