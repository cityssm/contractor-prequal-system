import { Router, RequestHandler } from "express";


import { handler as handler_contractors } from "../handlers/contractors";
import { handler as handler_doGetContractors } from "../handlers/doGetContractors";
import { handler as handler_doGetTradeCategoriesByContractorID } from "../handlers/doGetTradeCategoriesByContractorID";

import { handler as handler_doGetAllTradeCategories } from "../handlers/doGetAllTradeCategories";
import { handler as handler_doGetHealthSafetyOptions } from "../handlers/doGetHealthSafetyOptions";
import { handler as handler_doGetInsuranceOptions } from "../handlers/doGetInsuranceOptions";

import { handler as handler_doUpdateContractor } from "../handlers/doUpdateContractor";
import { handler as handler_doCreateDocuShareCollection } from "../handlers/doCreateDocuShareCollection";

import { handler as handler_doUpdateHealthSafety } from "../handlers/doUpdateHealthSafety";
import { handler as handler_doUpdateLegal } from "../handlers/doUpdateLegal";
import { handler as handler_doUpdateWSIB } from "../handlers/doUpdateWSIB";
import { handler as handler_doUpdateInsurance } from "../handlers/doUpdateInsurance";

import { handler as handler_doAddTradeCategory } from "../handlers/doAddTradeCategory";
import { handler as handler_doRemoveTradeCategory } from "../handlers/doRemoveTradeCategory";


const handler_updateOnly: RequestHandler = (req, res, next) => {

  if (req.session.user.canUpdate) {
    return next();
  }

  res.status(403);

  return res.json({
    success: false
  });
};


const router = Router();


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


export = router;
