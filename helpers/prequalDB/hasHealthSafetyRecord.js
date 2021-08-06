import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:hasHealthSafetyRecord");
export const hasHealthSafetyRecord = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
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
    catch (error) {
        debugSQL(error);
    }
    return false;
};
export default hasHealthSafetyRecord;
