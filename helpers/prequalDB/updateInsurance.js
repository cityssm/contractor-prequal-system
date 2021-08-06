import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import { hasWSIBInsuranceRecord } from "./hasWSIBInsuranceRecord.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateInsurance");
export const updateInsurance = async (updateForm) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        const insuranceAmount = updateForm.insurance_amount !== ""
            ? updateForm.insurance_amount
            : undefined;
        const expiryDateString = updateForm.insurance_expiryDate !== ""
            ? updateForm.insurance_expiryDate
            : undefined;
        const sql = (await hasWSIBInsuranceRecord(updateForm.contractorID))
            ? "update cpqs_p2" +
                " set cp2_insurancecompany = @insurance_company," +
                " cp2_insurancepolicynumber = @insurance_policyNumber," +
                " cp2_insuranceamount = @insurance_amount," +
                " cp2_insurancedate = @insurance_expiryDate" +
                " where cp2_contractorid = @contractorID"
            : "insert into cpqs_p2" +
                " (cp2_contractorid, cp2_insurancecompany, cp2_insurancepolicynumber, cp2_insuranceamount, cp2_insurancedate, cp2_creationdate)" +
                " values (@contractorID, @insurance_company, @insurance_policyNumber, @insurance_amount, @insurance_expiryDate, getdate())";
        await pool.request()
            .input("insurance_company", updateForm.insurance_company)
            .input("insurance_policyNumber", updateForm.insurance_policyNumber)
            .input("insurance_amount", insuranceAmount)
            .input("insurance_expiryDate", expiryDateString)
            .input("contractorID", updateForm.contractorID)
            .query(sql);
        return true;
    }
    catch (error) {
        debugSQL(error);
    }
    return false;
};
export default updateInsurance;
