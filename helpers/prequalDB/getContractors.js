"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractors = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const sqlFns = require("../sqlFns");
;
const getContractors = (canUpdate, filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        let sql = "select contractorID, docuShareCollectionID, isContractor," +
            " contractor_name, contractor_city, contractor_province," +
            " phone_name, phone_title," +
            (canUpdate
                ? " phone_number,"
                : " case when healthSafety_isSatisfactory = 1 and legal_isSatisfactory = 1 and wsib_isSatisfactory = 1 and insurance_isSatisfactory = 1 then phone_number else '' end as phone_number,") +
            " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
            " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
            " healthSafety_status, healthSafety_isSatisfactory," +
            " legal_note, legal_isSatisfactory" +
            " from Prequal.Contractor_SearchResults" +
            " where 1 = 1";
        if (filters.hasOwnProperty("isContractor")) {
            sql += " and isContractor = " + (filters.isContractor ? "1" : "0");
        }
        if (filters.hasOwnProperty("wsibIsSatisfactory")) {
            sql += " and wsib_isSatisfactory = " + (filters.wsibIsSatisfactory ? "1" : "0");
        }
        if (filters.hasOwnProperty("insuranceIsSatisfactory")) {
            sql += " and insurance_isSatisfactory = " + (filters.insuranceIsSatisfactory ? "1" : "0");
        }
        if (filters.hasOwnProperty("healthSafetyIsSatisfactory")) {
            sql += " and healthSafety_isSatisfactory = " + (filters.healthSafetyIsSatisfactory ? "1" : "0");
        }
        if (filters.hasOwnProperty("legalIsSatisfactory")) {
            sql += " and legal_isSatisfactory = " + (filters.legalIsSatisfactory ? "1" : "0");
        }
        if (filters.hasOwnProperty("hasDocuShareCollectionID")) {
            if (filters.hasDocuShareCollectionID) {
                sql += " and docuShareCollectionID is not null";
            }
            else {
                sql += " and docuShareCollectionID is null";
            }
        }
        if (filters.hasOwnProperty("tradeCategoryID")) {
            sql += " and contractorID in (select cp1b_contractorid from cpqs_p1_business where cp1b_typeid = '" + filters.tradeCategoryID.toString() + "')";
        }
        if (filters.hasOwnProperty("contractorName")) {
            const whereClausePiece = sqlFns.buildWhereClauseLike(["contractor_name"], filters.contractorName);
            if (whereClausePiece !== "") {
                sql += " and " + whereClausePiece;
            }
        }
        sql += " order by contractor_name, contractorID";
        const contractorResult = yield pool.request()
            .query(sql);
        if (!contractorResult.recordset) {
            return [];
        }
        const contractors = contractorResult.recordset;
        return contractors;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return [];
});
exports.getContractors = getContractors;
