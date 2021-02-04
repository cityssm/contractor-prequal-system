"use strict";
const express_1 = require("express");
const contractors_1 = require("../handlers/contractors");
const doGetContractors_1 = require("../handlers/doGetContractors");
const doGetTradeCategoriesByContractorID_1 = require("../handlers/doGetTradeCategoriesByContractorID");
const doGetHealthSafetyOptions_1 = require("../handlers/doGetHealthSafetyOptions");
const doGetInsuranceOptions_1 = require("../handlers/doGetInsuranceOptions");
const doUpdateHealthSafety_1 = require("../handlers/doUpdateHealthSafety");
const doUpdateLegal_1 = require("../handlers/doUpdateLegal");
const doUpdateWSIB_1 = require("../handlers/doUpdateWSIB");
const doUpdateInsurance_1 = require("../handlers/doUpdateInsurance");
const handler_updateOnly = (req, res, next) => {
    if (req.session.user.canUpdate) {
        return next();
    }
    res.status(403);
    return res.json({
        success: false
    });
};
const router = express_1.Router();
router.get("/", contractors_1.handler);
router.post("/doGetContractors", doGetContractors_1.handler);
router.post("/doGetTradeCategoriesByContractorID", doGetTradeCategoriesByContractorID_1.handler);
router.post("/doGetHealthSafetyOptions", doGetHealthSafetyOptions_1.handler);
router.post("/doGetInsuranceOptions", doGetInsuranceOptions_1.handler);
router.post("/doUpdateHealthSafety", handler_updateOnly, doUpdateHealthSafety_1.handler);
router.post("/doUpdateLegal", handler_updateOnly, doUpdateLegal_1.handler);
router.post("/doUpdateWSIB", handler_updateOnly, doUpdateWSIB_1.handler);
router.post("/doUpdateInsurance", handler_updateOnly, doUpdateInsurance_1.handler);
module.exports = router;
