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
exports.updateWSIB = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const hasWSIBInsuranceRecord_1 = require("./hasWSIBInsuranceRecord");
const updateWSIB = (updateForm) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(updateForm);
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const effectiveDateString = updateForm.wsib_effectiveDate !== ""
            ? updateForm.wsib_effectiveDate
            : null;
        const expiryDateString = updateForm.wsib_expiryDate !== ""
            ? updateForm.wsib_expiryDate
            : null;
        const isIndependent = updateForm.wsib_isIndependent && updateForm.wsib_isIndependent === "1"
            ? 1
            : 0;
        let sql;
        const hasRecord = yield hasWSIBInsuranceRecord_1.hasWSIBInsuranceRecord(updateForm.contractorID);
        if (hasRecord) {
            sql = "update cpqs_p2" +
                " set cp2_wsibaccountnumber = @wsib_accountNumber," +
                " cp2_wsibfirmnumber = @wsib_firmNumber," +
                " cp2_wsibdate = @wsib_effectiveDate," +
                " cp2_wsibexpirydate = @wsib_expiryDate," +
                " cp2_isindependent = @wsib_isIndependent" +
                " where cp2_contractorid = @contractorID";
        }
        else {
            sql = "insert into cpqs_p2" +
                " (cp2_contractorid, cp2_wsibaccountnumber, cp2_wsibfirmnumber, cp2_wsibdate, cp2_wsibexpirydate, cp2_isindependent, cp2_creationdate)" +
                " values (@contractorID, @wsib_accountNumber, @wsib_firmNumber, @wsib_effectiveDate, @wsib_expiryDate, @wsib_isIndependent, getdate())";
        }
        yield pool.request()
            .input("wsib_accountNumber", updateForm.wsib_accountNumber)
            .input("wsib_firmNumber", updateForm.wsib_firmNumber)
            .input("wsib_effectiveDate", effectiveDateString)
            .input("wsib_expiryDate", expiryDateString)
            .input("wsib_isIndependent", isIndependent)
            .input("contractorID", updateForm.contractorID)
            .query(sql);
        return true;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return false;
});
exports.updateWSIB = updateWSIB;
