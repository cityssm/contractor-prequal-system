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
exports.getDistinctInsuranceCompanyNames = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getDistinctInsuranceCompanyNames");
const getDistinctInsuranceCompanyNames = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select distinct insurance_company" +
            " from Prequal.Contractor_SearchResults" +
            " where insurance_company is not null" +
            " and insurance_company != ''" +
            " order by insurance_company";
        const result = yield pool.request().query(sql);
        if (!result.recordset) {
            return [];
        }
        const rawResults = result.recordset;
        const companyOptions = [];
        for (const rawResult of rawResults) {
            companyOptions.push(rawResult.insurance_company);
        }
        return companyOptions;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
});
exports.getDistinctInsuranceCompanyNames = getDistinctInsuranceCompanyNames;
