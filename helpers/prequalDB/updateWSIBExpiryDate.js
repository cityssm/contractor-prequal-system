import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateWSIBExpiryDate");
export const updateWSIBExpiryDate = async (accountNumber, expiryDate) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        await pool.request()
            .input("wsibExpiryDate", expiryDate)
            .input("wsibAccountNumber", accountNumber)
            .query("update cpqs_p2" +
            " set cp2_wsibexpirydate = @wsibExpiryDate" +
            " where cp2_wsibaccountnumber = @wsibAccountNumber");
        return true;
    }
    catch (error) {
        debugSQL(error);
    }
    return false;
};
export default updateWSIBExpiryDate;
