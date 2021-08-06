import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:hasWSIBInsuranceRecord");
export const hasWSIBInsuranceRecord = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        const result = await pool.request()
            .input("contractorID", contractorID)
            .query("select top 1 cp2_contractorid" +
            " from cpqs_p2" +
            " where cp2_contractorid = @contractorID");
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
export default hasWSIBInsuranceRecord;
