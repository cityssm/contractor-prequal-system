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
exports.getContractor = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getContractor");
const getContractor = (contractorID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const contractorResult = yield pool.request()
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
            return null;
        }
        const contractor = contractorResult.recordset[0];
        return contractor;
    }
    catch (e) {
        debugSQL(e);
    }
    return null;
});
exports.getContractor = getContractor;
