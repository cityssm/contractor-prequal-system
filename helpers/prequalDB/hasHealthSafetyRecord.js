"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasHealthSafetyRecord = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:hasHealthSafetyRecord");
const hasHealthSafetyRecord = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const result = await pool.request()
            .input("contractorID", contractorID)
            .query("select top 1 cpass_contractorid" +
            " from cpqs_pass" +
            " where cpass_contractorid = @contractorID");
        if (!result.recordset || result.recordset.length === 0) {
            return false;
        }
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.hasHealthSafetyRecord = hasHealthSafetyRecord;
