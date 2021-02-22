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
exports.getHealthSafetyStatusOptions = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getHealthSafetyStatusOptions");
const getHealthSafetyStatusOptions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select cso_status" +
            " from cpqs_statusoptions" +
            " where cso_isactive = 1" +
            " and cso_statustype = 'health'" +
            " order by cso_ordernum";
        const result = yield pool.request().query(sql);
        if (!result.recordset) {
            return [];
        }
        const rawResults = result.recordset;
        const statusOptions = [];
        for (const rawResult of rawResults) {
            statusOptions.push(rawResult.cso_status);
        }
        return statusOptions;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
});
exports.getHealthSafetyStatusOptions = getHealthSafetyStatusOptions;
