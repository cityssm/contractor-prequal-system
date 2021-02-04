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
exports.hasWSIBInsuranceRecord = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const hasWSIBInsuranceRecord = (contractorID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const result = yield pool.request()
            .input("contractorID", contractorID)
            .query("select top 1 cp2_contractorid" +
            " from cpqs_p2" +
            " where cp2_contractorid = @contractorID");
        if (!result.recordset || result.recordset.length === 0) {
            return false;
        }
        return true;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return false;
});
exports.hasWSIBInsuranceRecord = hasWSIBInsuranceRecord;
