"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTradeCategory = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:removeTradeCategory");
const removeTradeCategory = async (contractorID, tradeCategoryID) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        await pool.request()
            .input("contractorID", contractorID)
            .input("tradeCategoryID", tradeCategoryID)
            .query("delete from cpqs_p1_business" +
            " where cp1b_contractorid = @contractorID" +
            " and cp1b_typeid = @tradeCategoryID");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.removeTradeCategory = removeTradeCategory;
