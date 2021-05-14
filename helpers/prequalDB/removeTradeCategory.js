import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:removeTradeCategory");
export const removeTradeCategory = async (contractorID, tradeCategoryID) => {
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
export default removeTradeCategory;
