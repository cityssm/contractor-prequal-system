import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:removeTradeCategory");


export const removeTradeCategory = async (contractorID: number | string, tradeCategoryID: number | string): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    await pool.request()
      .input("contractorID", contractorID)
      .input("tradeCategoryID", tradeCategoryID)
      .query("delete from cpqs_p1_business" +
        " where cp1b_contractorid = @contractorID" +
        " and cp1b_typeid = @tradeCategoryID");

    return true;

  } catch (e) {
    debugSQL(e);
  }

  return false;
};


export default removeTradeCategory;
