import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import * as sqlFunctions from "../sqlFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getContractors");
const buildWhereClause = (filters) => {
    let whereClause = "";
    if (Object.prototype.hasOwnProperty.call(filters, "isContractor")) {
        whereClause += " and isContractor = " + (filters.isContractor ? "1" : "0");
    }
    if (Object.prototype.hasOwnProperty.call(filters, "updateYears")) {
        whereClause += " and datediff(year, updateTime, getDate()) <= " + filters.updateYears.toString();
    }
    if (Object.prototype.hasOwnProperty.call(filters, "hireStatus")) {
        switch (filters.hireStatus) {
            case "hireReady":
                whereClause += " and healthSafety_isSatisfactory = 1" +
                    " and legal_isSatisfactory = 1" +
                    " and wsib_isSatisfactory = 1" +
                    " and insurance_isSatisfactory = 1";
                break;
            case "cityApproved":
                whereClause += " and healthSafety_isSatisfactory = 1" +
                    " and legal_isSatisfactory = 1";
                break;
            case "partiallyApproved":
                whereClause += " and (healthSafety_isSatisfactory = 1" +
                    " or legal_isSatisfactory = 1)";
                break;
        }
    }
    if (Object.prototype.hasOwnProperty.call(filters, "hasDocuShareCollectionID")) {
        whereClause += filters.hasDocuShareCollectionID
            ? " and docuShareCollectionID is not null"
            : " and docuShareCollectionID is null";
    }
    if (Object.prototype.hasOwnProperty.call(filters, "tradeCategoryID")) {
        whereClause += " and contractorID in (select cp1b_contractorid from cpqs_p1_business where cp1b_typeid = '" + filters.tradeCategoryID.toString() + "')";
    }
    if (Object.prototype.hasOwnProperty.call(filters, "contractorName")) {
        const whereClausePiece = sqlFunctions.buildWhereClauseLike(["contractor_name"], filters.contractorName);
        if (whereClausePiece !== "") {
            whereClause += " and " + whereClausePiece;
        }
    }
    if (whereClause !== "") {
        whereClause = " where 1 = 1" + whereClause;
    }
    return whereClause;
};
export const getContractors = async (canUpdate, filters) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        const sql = "select contractorID, docuShareCollectionID, isContractor," +
            " contractor_name, contractor_city, contractor_province," +
            " phone_name, phone_title," +
            (canUpdate
                ? " phone_number,"
                : " case when healthSafety_isSatisfactory = 1 and legal_isSatisfactory = 1 and wsib_isSatisfactory = 1 and insurance_isSatisfactory = 1 then phone_number else '' end as phone_number,") +
            " email_name," +
            (canUpdate
                ? " email_address,"
                : " case when healthSafety_isSatisfactory = 1 and legal_isSatisfactory = 1 and wsib_isSatisfactory = 1 and insurance_isSatisfactory = 1 then email_address else '' end as email_address,") +
            " websiteURL," +
            " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
            " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
            " healthSafety_status, healthSafety_isSatisfactory," +
            (canUpdate
                ? " legal_note,"
                : " '' as legal_note,") +
            " legal_isSatisfactory" +
            " from Prequal.Contractor_SearchResults" +
            buildWhereClause(filters) +
            " order by contractor_name, contractorID";
        const contractorResult = await pool.request()
            .query(sql);
        if (!contractorResult.recordset) {
            return [];
        }
        const contractors = contractorResult.recordset;
        return contractors;
    }
    catch (error) {
        debugSQL(error);
    }
    return [];
};
export default getContractors;
