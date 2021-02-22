"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getContractors_1 = require("../helpers/prequalDB/getContractors");
const resultsCache = require("../helpers/queryResultsCache");
;
const handler = async (req, res) => {
    const formFilters = req.body;
    const queryFilters = {};
    if (formFilters.contractorName !== "") {
        queryFilters.contractorName = formFilters.contractorName;
    }
    if (formFilters.isHireReady === "1") {
        queryFilters.isContractor = true;
        queryFilters.wsibIsSatisfactory = true;
        queryFilters.insuranceIsSatisfactory = true;
        queryFilters.healthSafetyIsSatisfactory = true;
        queryFilters.legalIsSatisfactory = true;
    }
    if (formFilters.tradeCategoryID !== "") {
        queryFilters.tradeCategoryID = parseInt(formFilters.tradeCategoryID, 10);
    }
    if (!req.session.user.canUpdate) {
        queryFilters.healthSafetyIsSatisfactory = true;
        queryFilters.legalIsSatisfactory = true;
    }
    let contractors = resultsCache.getCachedResult(req.session.user.canUpdate, queryFilters);
    if (!contractors) {
        contractors = await getContractors_1.getContractors(req.session.user.canUpdate, queryFilters);
        resultsCache.cacheResult(req.session.user.canUpdate, queryFilters, contractors);
    }
    return res.json({
        contractors
    });
};
exports.handler = handler;
