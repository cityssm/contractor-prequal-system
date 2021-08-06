import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";

import * as recordTypes from "../../types/recordTypes";
import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getTradeCategoriesByContractorID");


export const getTradeCategoriesByContractorID = async (contractorID: number | string): Promise<recordTypes.TradeCategory[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));

    const categoryResult = await pool.request()
      .input("contractorID", contractorID)
      .query("select tradeCategoryID, tradeCategory" +
        " from Prequal.Contractor_TradeCategories" +
        " where contractorID = @contractorID" +
        " order by tradeCategory");

    if (!categoryResult.recordset) {
      return [];
    }

    const categories = categoryResult.recordset as recordTypes.TradeCategory[];

    return categories;

  } catch (error) {
    debugSQL(error);
  }

  return [];
};


export default getTradeCategoriesByContractorID;
