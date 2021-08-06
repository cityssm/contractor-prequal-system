import { Router, RequestHandler } from "express";


import handler_contractors from "../handlers/contractors.js";
import handler_doGetContractors from "../handlers/doGetContractors.js";
import handler_doGetTradeCategoriesByContractorID from "../handlers/doGetTradeCategoriesByContractorID.js";

import handler_doGetAllTradeCategories from "../handlers/doGetAllTradeCategories.js";
import handler_doGetHealthSafetyOptions from "../handlers/doGetHealthSafetyOptions.js";
import handler_doGetInsuranceOptions from "../handlers/doGetInsuranceOptions.js";

import handler_doUpdateContractor from "../handlers/doUpdateContractor.js";
import handler_doCreateDocuShareCollection from "../handlers/doCreateDocuShareCollection.js";

import handler_doUpdateHealthSafety from "../handlers/doUpdateHealthSafety.js";
import handler_doUpdateLegal from "../handlers/doUpdateLegal.js";
import handler_doUpdateWSIB from "../handlers/doUpdateWSIB.js";
import handler_doUpdateInsurance from "../handlers/doUpdateInsurance.js";

import handler_doAddTradeCategory from "../handlers/doAddTradeCategory.js";
import handler_doRemoveTradeCategory from "../handlers/doRemoveTradeCategory.js";


const handler_updateOnly: RequestHandler = (request, response, next) => {

  if (request.session.user.canUpdate) {
    return next();
  }

  response.status(403);

  return response.json({
    success: false
  });
};


export const router = Router();


router.get("/", handler_contractors);


router.post("/doGetContractors", handler_doGetContractors);


router.post("/doGetTradeCategoriesByContractorID", handler_doGetTradeCategoriesByContractorID);


/*
 * Updates
 */


router.post("/doGetAllTradeCategories", handler_doGetAllTradeCategories);


router.post("/doGetHealthSafetyOptions", handler_doGetHealthSafetyOptions);


router.post("/doGetInsuranceOptions", handler_doGetInsuranceOptions);


router.post("/doUpdateContractor", handler_updateOnly, handler_doUpdateContractor);
router.post("/doCreateDocuShareCollection", handler_updateOnly, handler_doCreateDocuShareCollection);


router.post("/doUpdateHealthSafety", handler_updateOnly, handler_doUpdateHealthSafety);


router.post("/doUpdateLegal", handler_updateOnly, handler_doUpdateLegal);


router.post("/doUpdateWSIB", handler_updateOnly, handler_doUpdateWSIB);


router.post("/doUpdateInsurance", handler_updateOnly, handler_doUpdateInsurance);


router.post("/doAddTradeCategory", handler_updateOnly, handler_doAddTradeCategory);
router.post("/doRemoveTradeCategory", handler_updateOnly, handler_doRemoveTradeCategory);


export default router;
