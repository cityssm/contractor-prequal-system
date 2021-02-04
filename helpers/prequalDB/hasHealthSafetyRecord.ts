import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


export const hasHealthSafetyRecord = async (contractorID: number | string): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const result = await pool.request()
      .input("contractorID", contractorID)
      .query("select top 1 cpass_contractorid" +
        " from cpqs_pass" +
        " where cpass_contractorid = @contractorID");

    if (!result.recordset || result.recordset.length === 0) {
      return false;
    }

    return true;

  } catch (e) {
    configFns.logger.error(e);
  }

  return false;
};
