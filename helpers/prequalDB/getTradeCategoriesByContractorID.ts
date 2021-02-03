import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import * as recordTypes from "../../types/recordTypes";
import type * as sqlTypes from "mssql";


export const getTradeCategoriesByContractorID = async (contractorID: number | string): Promise<recordTypes.TradeCategory[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

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

  } catch (e) {
    configFns.logger.error(e);
  }

  return [];
};
