import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


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
    configFns.logger.error(e);
  }

  return false;
};
