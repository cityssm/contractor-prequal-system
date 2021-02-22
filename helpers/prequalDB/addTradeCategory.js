"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTradeCategory = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:addTradeCategory");
const addTradeCategory = async (contractorID, tradeCategoryID) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        await pool.request()
            .input("contractorID", contractorID)
            .input("tradeCategoryID", tradeCategoryID)
            .query("insert into cpqs_p1_business" +
            " (cp1b_contractorid, cp1b_typeid, cp1b_creationdate)" +
            " values (@contractorID, @tradeCategoryID, getdate())");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.addTradeCategory = addTradeCategory;
