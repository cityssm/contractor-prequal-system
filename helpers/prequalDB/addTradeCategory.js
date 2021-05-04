import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:addTradeCategory");
export const addTradeCategory = async (contractorID, tradeCategoryID) => {
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
