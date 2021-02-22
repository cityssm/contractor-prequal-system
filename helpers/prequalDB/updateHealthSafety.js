"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHealthSafety = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const hasHealthSafetyRecord_1 = require("./hasHealthSafetyRecord");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateHealthSafety");
const updateHealthSafety = async (updateForm) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        let sql;
        if (await hasHealthSafetyRecord_1.hasHealthSafetyRecord(updateForm.contractorID)) {
            sql = "update cpqs_pass" +
                " set cpass_status = @healthSafety_status" +
                " where cpass_contractorid = @contractorID";
        }
        else {
            sql = "insert into cpqs_pass" +
                " (cpass_contractorid, cpass_status)" +
                " values (@contractorID, @healthSafety_status)";
        }
        await pool.request()
            .input("healthSafety_status", updateForm.healthSafety_status)
            .input("contractorID", updateForm.contractorID)
            .query(sql);
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.updateHealthSafety = updateHealthSafety;
