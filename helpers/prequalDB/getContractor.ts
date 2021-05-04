import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";
import type { Contractor } from "../../types/recordTypes";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getContractor");


export const getContractor = async (contractorID: number | string): Promise<Contractor> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const contractorResult = await pool.request()
      .input("contractorID", contractorID)
      .query("select contractorID, docuShareCollectionID, isContractor," +
        " contractor_name, contractor_city, contractor_province," +
        " phone_name, phone_title, phone_number," +
        " websiteURL," +
        " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
        " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
        " healthSafety_status, healthSafety_isSatisfactory," +
        " legal_note, legal_isSatisfactory" +
        " from Prequal.Contractor_SearchResults" +
        " where contractorID = @contractorID");

    if (!contractorResult.recordset || contractorResult.recordset.length === 0) {
      return null;
    }

    const contractor = contractorResult.recordset[0] as Contractor;

    return contractor;

  } catch (e) {
    debugSQL(e);
  }

  return null;
};
