"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiredWSIBAccountNumbers = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getExpiredWSIBAccountNumbers");
const getExpiredWSIBAccountNumbers = async (limit = 50) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select top " + limit.toString() + " wsib_accountNumber" +
            " from Prequal.Contractor_SearchResults" +
            " where IsContractor = 1" +
            " and Legal_IsSatisfactory = 1" +
            " and HealthSafety_IsSatisfactory = 1" +
            " and WSIB_IsIndependent = 0" +
            " and WSIB_ExpiryDate < getdate()" +
            " and WSIB_AccountNumber like '[0-9][0-9]%[0-9][0-9]'" +
            " order by Insurance_IsSatisfactory desc, Insurance_ExpiryDate desc";
        const wsibResult = await pool.request().query(sql);
        if (!wsibResult.recordset) {
            return [];
        }
        const rawResults = wsibResult.recordset;
        const accountNumbers = [];
        for (const rawResult of rawResults) {
            accountNumbers.push(rawResult.wsib_accountNumber);
        }
        return accountNumbers;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
};
exports.getExpiredWSIBAccountNumbers = getExpiredWSIBAccountNumbers;
