import { Router } from "express";
import { handler as handler_contractors } from "../handlers/contractors.js";
import { handler as handler_doGetContractors } from "../handlers/doGetContractors.js";
import { handler as handler_doGetTradeCategoriesByContractorID } from "../handlers/doGetTradeCategoriesByContractorID.js";
import { handler as handler_doGetAllTradeCategories } from "../handlers/doGetAllTradeCategories.js";
import { handler as handler_doGetHealthSafetyOptions } from "../handlers/doGetHealthSafetyOptions.js";
import { handler as handler_doGetInsuranceOptions } from "../handlers/doGetInsuranceOptions.js";
import { handler as handler_doUpdateContractor } from "../handlers/doUpdateContractor.js";
import { handler as handler_doCreateDocuShareCollection } from "../handlers/doCreateDocuShareCollection.js";
import { handler as handler_doUpdateHealthSafety } from "../handlers/doUpdateHealthSafety.js";
import { handler as handler_doUpdateLegal } from "../handlers/doUpdateLegal.js";
import { handler as handler_doUpdateWSIB } from "../handlers/doUpdateWSIB.js";
import { handler as handler_doUpdateInsurance } from "../handlers/doUpdateInsurance.js";
import { handler as handler_doAddTradeCategory } from "../handlers/doAddTradeCategory.js";
import { handler as handler_doRemoveTradeCategory } from "../handlers/doRemoveTradeCategory.js";
const handler_updateOnly = (req, res, next) => {
    if (req.session.user.canUpdate) {
        return next();
    }
    res.status(403);
    return res.json({
        success: false
    });
};
export const router = Router();
router.get("/", handler_contractors);
router.post("/doGetContractors", handler_doGetContractors);
router.post("/doGetTradeCategoriesByContractorID", handler_doGetTradeCategoriesByContractorID);
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
