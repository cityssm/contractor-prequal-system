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
exports.updateWSIBExpiryDate = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const updateWSIBExpiryDate = (accountNumber, expiryDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        yield pool.request()
            .input("wsibExpiryDate", expiryDate)
            .input("wsibAccountNumber", accountNumber)
            .query("update cpqs_p2" +
            " set cp2_wsibexpirydate = @wsibExpiryDate" +
            " where cp2_wsibaccountnumber = @wsibAccountNumber");
        return true;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return false;
});
exports.updateWSIBExpiryDate = updateWSIBExpiryDate;
