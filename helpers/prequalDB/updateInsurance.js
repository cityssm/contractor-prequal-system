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
exports.updateInsurance = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const hasWSIBInsuranceRecord_1 = require("./hasWSIBInsuranceRecord");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateInsurance");
const updateInsurance = (updateForm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const insuranceAmount = updateForm.insurance_amount !== ""
            ? updateForm.insurance_amount
            : null;
        const expiryDateString = updateForm.insurance_expiryDate !== ""
            ? updateForm.insurance_expiryDate
            : null;
        let sql;
        if (yield hasWSIBInsuranceRecord_1.hasWSIBInsuranceRecord(updateForm.contractorID)) {
            sql = "update cpqs_p2" +
                " set cp2_insurancecompany = @insurance_company," +
                " cp2_insurancepolicynumber = @insurance_policyNumber," +
                " cp2_insuranceamount = @insurance_amount," +
                " cp2_insurancedate = @insurance_expiryDate" +
                " where cp2_contractorid = @contractorID";
        }
        else {
            sql = "insert into cpqs_p2" +
                " (cp2_contractorid, cp2_insurancecompany, cp2_insurancepolicynumber, cp2_insuranceamount, cp2_insurancedate, cp2_creationdate)" +
                " values (@contractorID, @insurance_company, @insurance_policyNumber, @insurance_amount, @insurance_expiryDate, getdate())";
        }
        yield pool.request()
            .input("insurance_company", updateForm.insurance_company)
            .input("insurance_policyNumber", updateForm.insurance_policyNumber)
            .input("insurance_amount", insuranceAmount)
            .input("insurance_expiryDate", expiryDateString)
            .input("contractorID", updateForm.contractorID)
            .query(sql);
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
});
exports.updateInsurance = updateInsurance;
