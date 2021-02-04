import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


interface RawResult {
  insurance_company: string;
}


export const getDistinctInsuranceCompanyNames = async (): Promise<string[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const sql = "select distinct insurance_company" +
    " from Prequal.Contractor_SearchResults" +
    " where insurance_company is not null" +
    " and insurance_company != ''" +
    " order by insurance_company";

    const result = await pool.request().query(sql);

    if (!result.recordset) {
      return [];
    }

    const rawResults = result.recordset as RawResult[];

    const companyOptions = [];

    for (const rawResult of rawResults) {
      companyOptions.push(rawResult.insurance_company);
    }

    return companyOptions;

  } catch (e) {
    configFns.logger.error(e);
  }

  return [];
};
