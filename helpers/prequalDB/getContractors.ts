import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";
import type { Contractor } from "../../types/recordTypes";


export interface GetContractorFilters {
  contractorName?: string;
  tradeCategoryID?: number;
  isContractor?: boolean;
  wsibIsSatisfactory?: boolean;
  insuranceIsSatisfactory?: boolean;
  healthSafetyIsSatisfactory?: boolean;
  legalIsSatisfactory?: boolean;
};


export const getContractors = async (filters: GetContractorFilters): Promise<Contractor[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    let sql = "select contractorID, docushareCollectionID, isContractor," +
      " contractor_name, contractor_city, contractor_province," +
      " phone_name, phone_title, phone_number," +
      " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
      " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
      " healthSafety_status, healthSafety_isSatisfactory," +
      " legal_note, legal_isSatisfactory" +
      " from Prequal.Contractor_SearchResults" +
      " where 1 = 1";

    if (filters.hasOwnProperty("isContractor")) {
      sql += " and isContractor = " + (filters.isContractor ? "1" : "0");
    }

    if (filters.hasOwnProperty("wsibIsSatisfactory")) {
      sql += " and wsib_isSatisfactory = " + (filters.wsibIsSatisfactory ? "1" : "0");
    }

    if (filters.hasOwnProperty("insuranceIsSatisfactory")) {
      sql += " and insurance_isSatisfactory = " + (filters.insuranceIsSatisfactory ? "1" : "0");
    }

    if (filters.hasOwnProperty("healthSafetyIsSatisfactory")) {
      sql += " and healthSafety_isSatisfactory = " + (filters.healthSafetyIsSatisfactory ? "1" : "0");
    }

    if (filters.hasOwnProperty("legalIsSatisfactory")) {
      sql += " and legal_isSatisfactory = " + (filters.legalIsSatisfactory ? "1" : "0");
    }

    sql += " order by contractor_name, contractorID";

    const contractorResult = await pool.request()
      .query(sql);

    if (!contractorResult.recordset) {
      return [];
    }

    const contractors = contractorResult.recordset as Contractor[];

    return contractors;

  } catch (e) {
    configFns.logger.error(e);
  }

  return [];
};
