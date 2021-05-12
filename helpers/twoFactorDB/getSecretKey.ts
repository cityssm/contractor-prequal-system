import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:twoFactorDB:getSecretKey");


export const getSecretKey = async (userName: string): Promise<string> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("twoFactor.mssqlConfig"));

    const userResult = await pool.request()
      .input("userName", userName)
      .query("select secretKey from TwoFactor" +
        " where enforce2FA = 1" +
        " and userName = @userName");

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return null;
    }

    return userResult.recordset[0].secretKey;

  } catch (e) {
    debugSQL(e);
  }

  return null;
};


export default getSecretKey;
