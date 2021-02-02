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
exports.getExpiredWSIBAccountNumbers = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const getExpiredWSIBAccountNumbers = (limit = 50) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select top " + limit.toString() + " wsib_accountNumber" +
            " from Prequal.Contractor_SearchResults" +
            " where IsContractor = 1" +
            " and Legal_IsSatisfactory = 1" +
            " and HealthSafety_IsSatisfactory = 1" +
            " and WSIB_IsIndependent = 0" +
            " and WSIB_ExpiryDate < getdate()" +
            " and WSIB_AccountNumber like '[0-9][0-9]%[0-9][0-9]'" +
            " order by Insurance_IsSatisfactory desc, Insurance_ExpiryDate desc";
        const wsibResult = yield pool.request().query(sql);
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
    catch (e) {
        configFns.logger.error(e);
    }
    return [];
});
exports.getExpiredWSIBAccountNumbers = getExpiredWSIBAccountNumbers;
