"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getContractors_1 = require("../helpers/prequalDB/getContractors");
const resultsCache = require("../helpers/queryResultsCache");
;
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formFilters = req.body;
    const queryFilters = {};
    if (formFilters.contractorName !== "") {
        queryFilters.contractorName = formFilters.contractorName;
    }
    if (!req.session.user.canUpdate || formFilters.isHireReady === "1") {
        queryFilters.isContractor = true;
        queryFilters.wsibIsSatisfactory = true;
        queryFilters.insuranceIsSatisfactory = true;
        queryFilters.healthSafetyIsSatisfactory = true;
        queryFilters.legalIsSatisfactory = true;
    }
    if (formFilters.tradeCategoryID !== "") {
        queryFilters.tradeCategoryID = parseInt(formFilters.tradeCategoryID, 10);
    }
    let contractors = resultsCache.getCachedResult(req.session.user.canUpdate, queryFilters);
    if (!contractors) {
        contractors = yield getContractors_1.getContractors(queryFilters);
        resultsCache.cacheResult(req.session.user.canUpdate, queryFilters, contractors);
    }
    return res.json({
        contractors
    });
});
exports.handler = handler;
