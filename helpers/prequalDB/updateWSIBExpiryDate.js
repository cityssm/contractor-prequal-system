"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWSIBExpiryDate = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateWSIBExpiryDate");
const updateWSIBExpiryDate = async (accountNumber, expiryDate) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        await pool.request()
            .input("wsibExpiryDate", expiryDate)
            .input("wsibAccountNumber", accountNumber)
            .query("update cpqs_p2" +
            " set cp2_wsibexpirydate = @wsibExpiryDate" +
            " where cp2_wsibaccountnumber = @wsibAccountNumber");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.updateWSIBExpiryDate = updateWSIBExpiryDate;
