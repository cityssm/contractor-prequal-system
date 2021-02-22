"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getDistinctInsuranceCompanyNames_1 = require("../helpers/prequalDB/getDistinctInsuranceCompanyNames");
const handler = async (_req, res) => {
    const insuranceCompanyNames = await getDistinctInsuranceCompanyNames_1.getDistinctInsuranceCompanyNames();
    return res.json({
        insuranceCompanyNames
    });
};
exports.handler = handler;
