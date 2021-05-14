import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getTradeCategories");
export const getTradeCategories = async (inUse) => {
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
export default getTradeCategories;
