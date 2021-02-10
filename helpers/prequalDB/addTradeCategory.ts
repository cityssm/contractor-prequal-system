import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


export const addTradeCategory = async (contractorID: number | string, tradeCategoryID: number | string): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    await pool.request()
      .input("contractorID", contractorID)
      .input("tradeCategoryID", tradeCategoryID)
      .query("insert into cpqs_p1_business" +
        " (cp1b_contractorid, cp1b_typeid, cp1b_creationdate)" +
        " values (@contractorID, @tradeCategoryID, getdate())");

    return true;

  } catch (e) {
    configFns.logger.error(e);
  }

  return false;
};
