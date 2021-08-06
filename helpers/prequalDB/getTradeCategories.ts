import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";

import * as recordTypes from "../../types/recordTypes";
import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getTradeCategories");


export const getTradeCategories = async (inUse: boolean): Promise<recordTypes.TradeCategory[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));

    let sql = "";

    sql = inUse
      ? "select distinct tradeCategoryID, tradeCategory" +
      " from Prequal.Contractor_TradeCategories" +
      " order by tradeCategory"
      : "select cbt_typeid as tradeCategoryID," +
      " cbt_type as tradeCategory" +
      " from cpqs_businesstypes" +
      " order by cbt_type";

    const categoryResult = await pool.request()
      .query(sql);

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


export default getTradeCategories;
