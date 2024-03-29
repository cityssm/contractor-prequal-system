import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateContractor");
export const updateContractor = async (updateForm) => {
    try {
        const pool = await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));
        await pool.request()
            .input("docuShareCollectionID", updateForm.docuShareCollectionID === "" ? undefined : updateForm.docuShareCollectionID)
            .input("contractorID", updateForm.contractorID)
            .query("update cpqs_contractors" +
            " set cc_docusharecollectionid = @docuShareCollectionID" +
            " where cc_contractorid = @contractorID");
        return true;
    }
    catch (error) {
        debugSQL(error);
    }
    return false;
};
export default updateContractor;
