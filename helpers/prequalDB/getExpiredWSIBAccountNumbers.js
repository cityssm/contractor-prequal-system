import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getExpiredWSIBAccountNumbers");
export const getExpiredWSIBAccountNumbers = async (limit = 50) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        const sql = "select top " + limit.toString() + " wsib_accountNumber" +
            " from Prequal.Contractor_SearchResults" +
            " where IsContractor = 1" +
            " and Legal_IsSatisfactory = 1" +
            " and HealthSafety_IsSatisfactory = 1" +
            " and WSIB_IsIndependent = 0" +
            " and WSIB_ExpiryDate < getdate()" +
            " and WSIB_AccountNumber like '[0-9][0-9]%[0-9][0-9]'" +
            " order by Insurance_IsSatisfactory desc, Insurance_ExpiryDate desc";
        const wsibResult = await pool.request().query(sql);
        if (!wsibResult.recordset) {
            return [];
        }
        const rawResults = wsibResult.recordset;
        const accountNumbers = [];
        for (const rawResult of rawResults) {
            accountNumbers.push(rawResult.wsib_accountNumber);
        }
        return accountNumbers;
    }
    catch (error) {
        debugSQL(error);
    }
    return [];
};
export default getExpiredWSIBAccountNumbers;
