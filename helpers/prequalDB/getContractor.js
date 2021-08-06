import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getContractor");
export const getContractor = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        const contractorResult = await pool.request()
            .input("contractorID", contractorID)
            .query("select contractorID, docuShareCollectionID, isContractor," +
            " contractor_name, contractor_city, contractor_province," +
            " phone_name, phone_title, phone_number," +
            " websiteURL," +
            " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
            " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
            " healthSafety_status, healthSafety_isSatisfactory," +
            " legal_note, legal_isSatisfactory" +
            " from Prequal.Contractor_SearchResults" +
            " where contractorID = @contractorID");
        if (!contractorResult.recordset || contractorResult.recordset.length === 0) {
            return undefined;
        }
        const contractor = contractorResult.recordset[0];
        return contractor;
    }
    catch (error) {
        debugSQL(error);
    }
    return undefined;
};
export default getContractor;
