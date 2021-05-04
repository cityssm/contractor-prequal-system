import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getExpiredWSIBAccountNumbers");


interface RawResult {
  wsib_accountNumber: string;
}


export const getExpiredWSIBAccountNumbers = async (limit: number = 50): Promise<string[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const sql = "select top " + limit.toString() + " wsib_accountNumber" +
      " from Prequal.Contractor_SearchResults" +
      " where IsContractor = 1" +
      " and Legal_IsSatisfactory = 1" +
      " and HealthSafety_IsSatisfactory = 1" +
      " and WSIB_IsIndependent = 0" +
      " and WSIB_ExpiryDate < getdate()" +
      " and WSIB_AccountNumber like '[0-9][0-9]%[0-9][0-9]'" +
      " order by Insurance_IsSatisfactory desc, Insurance_ExpiryDate desc";

    const wsibResult = await pool.request().query(sql);

    if (!wsibResult.recordset) {
      return [];
    }

    const rawResults = wsibResult.recordset as RawResult[];

    const accountNumbers = [];

    for (const rawResult of rawResults) {
      accountNumbers.push(rawResult.wsib_accountNumber);
    }

    return accountNumbers;

  } catch (e) {
    debugSQL(e);
  }

  return [];
};
