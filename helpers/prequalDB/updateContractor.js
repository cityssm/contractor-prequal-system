import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateContractor");
export const updateContractor = async (updateForm) => {
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
