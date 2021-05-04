import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:hasWSIBInsuranceRecord");


export const hasWSIBInsuranceRecord = async (contractorID: number | string): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const result = await pool.request()
      .input("contractorID", contractorID)
      .query("select top 1 cp2_contractorid" +
        " from cpqs_p2" +
        " where cp2_contractorid = @contractorID");

    if (!result.recordset || result.recordset.length === 0) {
      return false;
    }

    return true;

  } catch (e) {
    debugSQL(e);
  }

  return false;
};
