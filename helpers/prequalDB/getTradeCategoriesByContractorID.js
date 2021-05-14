import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getTradeCategoriesByContractorID");
export const getTradeCategoriesByContractorID = async (contractorID) => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const categoryResult = await pool.request()
            .input("contractorID", contractorID)
            .query("select tradeCategoryID, tradeCategory" +
            " from Prequal.Contractor_TradeCategories" +
            " where contractorID = @contractorID" +
            " order by tradeCategory");
        if (!categoryResult.recordset) {
            return [];
        }
        const categories = categoryResult.recordset;
        return categories;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
};
export default getTradeCategoriesByContractorID;
