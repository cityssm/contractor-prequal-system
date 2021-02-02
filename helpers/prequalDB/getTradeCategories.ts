import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import * as recordTypes from "../../types/recordTypes";
import type * as sqlTypes from "mssql";


export const getTradeCategories = async (inUse: boolean): Promise<recordTypes.TradeCategory[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    let sql = "";

    if (inUse) {
      sql = "select distinct tradeCategoryID, tradeCategory" +
        " from Prequal.Contractor_TradeCategories" +
        " order by tradeCategory";
    } else {
      sql = "select cbt_typeid as tradeCategoryID," +
        " cbt_type as tradeCategory" +
        " from cpqs_businesstypes" +
        " order by cbt_type";
    }

    const categoryResult = await pool.request()
      .query(sql);

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
