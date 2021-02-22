"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractors = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const sqlFns = require("../sqlFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getContractors");
;
const buildWhereClause = (filters) => {
    let whereClause = "";
    if (filters.hasOwnProperty("isContractor")) {
        whereClause += " and isContractor = " + (filters.isContractor ? "1" : "0");
    }
    if (filters.hasOwnProperty("wsibIsSatisfactory")) {
        whereClause += " and wsib_isSatisfactory = " + (filters.wsibIsSatisfactory ? "1" : "0");
    }
    if (filters.hasOwnProperty("insuranceIsSatisfactory")) {
        whereClause += " and insurance_isSatisfactory = " + (filters.insuranceIsSatisfactory ? "1" : "0");
    }
    if (filters.hasOwnProperty("healthSafetyIsSatisfactory")) {
        whereClause += " and healthSafety_isSatisfactory = " + (filters.healthSafetyIsSatisfactory ? "1" : "0");
    }
    if (filters.hasOwnProperty("legalIsSatisfactory")) {
        whereClause += " and legal_isSatisfactory = " + (filters.legalIsSatisfactory ? "1" : "0");
    }
    if (filters.hasOwnProperty("hasDocuShareCollectionID")) {
        if (filters.hasDocuShareCollectionID) {
            whereClause += " and docuShareCollectionID is not null";
        }
        else {
            whereClause += " and docuShareCollectionID is null";
        }
    }
    if (filters.hasOwnProperty("tradeCategoryID")) {
        whereClause += " and contractorID in (select cp1b_contractorid from cpqs_p1_business where cp1b_typeid = '" + filters.tradeCategoryID.toString() + "')";
    }
    if (filters.hasOwnProperty("contractorName")) {
        const whereClausePiece = sqlFns.buildWhereClauseLike(["contractor_name"], filters.contractorName);
        if (whereClausePiece !== "") {
            whereClause += " and " + whereClausePiece;
        }
    }
    if (whereClause !== "") {
        whereClause = " where 1 = 1" + whereClause;
    }
    return whereClause;
};
const getContractors = async (canUpdate, filters) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select contractorID, docuShareCollectionID, isContractor," +
            " contractor_name, contractor_city, contractor_province," +
            " phone_name, phone_title," +
            (canUpdate
                ? " phone_number,"
                : " case when healthSafety_isSatisfactory = 1 and legal_isSatisfactory = 1 and wsib_isSatisfactory = 1 and insurance_isSatisfactory = 1 then phone_number else '' end as phone_number,") +
            " websiteURL," +
            " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
            " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
            " healthSafety_status, healthSafety_isSatisfactory," +
            " legal_note, legal_isSatisfactory" +
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
    catch (e) {
        debugSQL(e);
    }
    return [];
};
exports.getContractors = getContractors;
