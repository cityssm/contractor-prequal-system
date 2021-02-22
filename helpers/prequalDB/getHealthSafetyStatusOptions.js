"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthSafetyStatusOptions = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:getHealthSafetyStatusOptions");
const getHealthSafetyStatusOptions = async () => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select cso_status" +
            " from cpqs_statusoptions" +
            " where cso_isactive = 1" +
            " and cso_statustype = 'health'" +
            " order by cso_ordernum";
        const result = await pool.request().query(sql);
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
};
exports.getHealthSafetyStatusOptions = getHealthSafetyStatusOptions;
