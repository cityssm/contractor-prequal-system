"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLegal = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateLegal");
const updateLegal = async (updateForm, reqSession) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        await pool.request()
            .input("legal_isSatisfactory", updateForm.legal_isSatisfactory === "1" ? 1 : 0)
            .input("legal_updateTime", new Date())
            .input("legal_updateUser", reqSession.user.userName)
            .input("contractorID", updateForm.contractorID)
            .query("update cpqs_contractors" +
            " set cc_legal_issatisfactory = @legal_isSatisfactory," +
            " cc_legal_updatetime = @legal_updateTime," +
            " cc_legal_updateuser = @legal_updateUser" +
            " where cc_contractorid = @contractorID");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.updateLegal = updateLegal;
