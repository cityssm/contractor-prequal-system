import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:twoFactorBD:has2FA");


export const has2FA = async (userName: string): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFunctions.getProperty("twoFactor.mssqlConfig"));

    const userResult = await pool.request()
      .input("userName", userName)
      .query("select enforce2FA from TwoFactor" +
        " where userName = @userName");

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return false;
    }

    return userResult.recordset[0].enforce2FA;

  } catch (error) {
    debugSQL(error);
  }

  return false;
};


export default has2FA;
