"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeCategoriesByContractorID = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getTradeCategoriesByContractorID");
const getTradeCategoriesByContractorID = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const categoryResult = await pool.request()
            .input("contractorID", contractorID)
            .query("select tradeCategoryID, tradeCategory" +
            " from Prequal.Contractor_TradeCategories" +
            " where contractorID = @contractorID" +
            " order by tradeCategory");
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
exports.getTradeCategoriesByContractorID = getTradeCategoriesByContractorID;
