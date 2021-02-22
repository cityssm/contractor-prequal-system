"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeCategories = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getTradeCategories");
const getTradeCategories = async (inUse) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        let sql = "";
        if (inUse) {
            sql = "select distinct tradeCategoryID, tradeCategory" +
                " from Prequal.Contractor_TradeCategories" +
                " order by tradeCategory";
        }
        else {
            sql = "select cbt_typeid as tradeCategoryID," +
                " cbt_type as tradeCategory" +
                " from cpqs_businesstypes" +
                " order by cbt_type";
        }
        const categoryResult = await pool.request()
            .query(sql);
        if (!categoryResult.recordset) {
            return [];
        }
        const categories = categoryResult.recordset;
        return categories;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
};
exports.getTradeCategories = getTradeCategories;
