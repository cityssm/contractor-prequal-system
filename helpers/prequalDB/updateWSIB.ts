import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import { hasWSIBInsuranceRecord } from "./hasWSIBInsuranceRecord";

import type * as sqlTypes from "mssql";

import { debug } from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateWSIB");


export interface WSIBForm {
  contractorID: string;
  wsib_isIndependent?: "1";
  wsib_accountNumber: string;
  wsib_firmNumber: string;
  wsib_effectiveDate: string;
  wsib_expiryDate: string;
}


export const updateWSIB = async (updateForm: WSIBForm): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    const effectiveDateString = updateForm.wsib_effectiveDate !== ""
      ? updateForm.wsib_effectiveDate
      : null;

    const expiryDateString = updateForm.wsib_expiryDate !== ""
      ? updateForm.wsib_expiryDate
      : null;

    const isIndependent = updateForm.wsib_isIndependent && updateForm.wsib_isIndependent === "1"
      ? 1
      : 0;

    let sql: string;

    const hasRecord = await hasWSIBInsuranceRecord(updateForm.contractorID);

    if (hasRecord) {
      sql = "update cpqs_p2" +
        " set cp2_wsibaccountnumber = @wsib_accountNumber," +
        " cp2_wsibfirmnumber = @wsib_firmNumber," +
        " cp2_wsibdate = @wsib_effectiveDate," +
        " cp2_wsibexpirydate = @wsib_expiryDate," +
        " cp2_isindependent = @wsib_isIndependent" +
        " where cp2_contractorid = @contractorID";
    } else {
      sql = "insert into cpqs_p2" +
        " (cp2_contractorid, cp2_wsibaccountnumber, cp2_wsibfirmnumber, cp2_wsibdate, cp2_wsibexpirydate, cp2_isindependent, cp2_creationdate)" +
        " values (@contractorID, @wsib_accountNumber, @wsib_firmNumber, @wsib_effectiveDate, @wsib_expiryDate, @wsib_isIndependent, getdate())";
    }

    await pool.request()
      .input("wsib_accountNumber", updateForm.wsib_accountNumber)
      .input("wsib_firmNumber", updateForm.wsib_firmNumber)
      .input("wsib_effectiveDate", effectiveDateString)
      .input("wsib_expiryDate", expiryDateString)
      .input("wsib_isIndependent", isIndependent)
      .input("contractorID", updateForm.contractorID)
      .query(sql);

    return true;

  } catch (e) {
    debugSQL(e);
  }

  return false;
};
