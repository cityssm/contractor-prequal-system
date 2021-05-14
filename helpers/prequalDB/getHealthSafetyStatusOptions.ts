import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getHealthSafetyStatusOptions");


interface RawResult {
  cso_status: string;
}


export const getHealthSafetyStatusOptions = async (): Promise<string[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const sql = "select cso_status" +
      " from cpqs_statusoptions" +
      " where cso_isactive = 1" +
      " and cso_statustype = 'health'" +
      " order by cso_ordernum";

    const result = await pool.request().query(sql);

    if (!result.recordset) {
      return [];
    }

    const rawResults = result.recordset as RawResult[];

    const statusOptions = [];

    for (const rawResult of rawResults) {
      statusOptions.push(rawResult.cso_status);
    }

    return statusOptions;

  } catch (e) {
    debugSQL(e);
  }

  return [];
};


export default getHealthSafetyStatusOptions;
