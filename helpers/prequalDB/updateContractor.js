"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContractor = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:updateContractor");
const updateContractor = async (updateForm) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        await pool.request()
            .input("docuShareCollectionID", updateForm.docuShareCollectionID === "" ? null : updateForm.docuShareCollectionID)
            .input("contractorID", updateForm.contractorID)
            .query("update cpqs_contractors" +
            " set cc_docusharecollectionid = @docuShareCollectionID" +
            " where cc_contractorid = @contractorID");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
};
exports.updateContractor = updateContractor;
