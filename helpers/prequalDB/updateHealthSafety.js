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
exports.updateHealthSafety = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const hasHealthSafetyRecord_1 = require("./hasHealthSafetyRecord");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateHealthSafety");
const updateHealthSafety = (updateForm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        let sql;
        if (yield hasHealthSafetyRecord_1.hasHealthSafetyRecord(updateForm.contractorID)) {
            sql = "update cpqs_pass" +
                " set cpass_status = @healthSafety_status" +
                " where cpass_contractorid = @contractorID";
        }
        else {
            sql = "insert into cpqs_pass" +
                " (cpass_contractorid, cpass_status)" +
                " values (@contractorID, @healthSafety_status)";
        }
        yield pool.request()
            .input("healthSafety_status", updateForm.healthSafety_status)
            .input("contractorID", updateForm.contractorID)
            .query(sql);
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
});
exports.updateHealthSafety = updateHealthSafety;
