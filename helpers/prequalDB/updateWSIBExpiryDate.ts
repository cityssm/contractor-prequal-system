import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


export const updateWSIBExpiryDate = async (accountNumber: string, expiryDate: Date): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    await pool.request()
      .input("wsibExpiryDate", expiryDate)
      .input("wsibAccountNumber", accountNumber)
      .query("update cpqs_p2" +
        " set cp2_wsibexpirydate = @wsibExpiryDate" +
        " where cp2_wsibaccountnumber = @wsibAccountNumber");

    return true;

  } catch (e) {
    configFns.logger.error(e);
  }

  return false;
};
