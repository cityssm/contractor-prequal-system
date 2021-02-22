"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistinctInsuranceCompanyNames = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getDistinctInsuranceCompanyNames");
const getDistinctInsuranceCompanyNames = async () => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select distinct insurance_company" +
            " from Prequal.Contractor_SearchResults" +
            " where insurance_company is not null" +
            " and insurance_company != ''" +
            " order by insurance_company";
        const result = await pool.request().query(sql);
        if (!result.recordset) {
            return [];
        }
        const rawResults = result.recordset;
        const companyOptions = [];
        for (const rawResult of rawResults) {
            companyOptions.push(rawResult.insurance_company);
        }
        return companyOptions;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
};
exports.getDistinctInsuranceCompanyNames = getDistinctInsuranceCompanyNames;
