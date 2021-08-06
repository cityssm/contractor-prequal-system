import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";

import { hasWSIBInsuranceRecord } from "./hasWSIBInsuranceRecord.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
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
      await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));

    const effectiveDateString = updateForm.wsib_effectiveDate !== ""
      ? updateForm.wsib_effectiveDate
      : undefined;

    const expiryDateString = updateForm.wsib_expiryDate !== ""
      ? updateForm.wsib_expiryDate
      : undefined;

    const isIndependent = updateForm.wsib_isIndependent && updateForm.wsib_isIndependent === "1"
      ? 1
      : 0;

    const hasRecord = await hasWSIBInsuranceRecord(updateForm.contractorID);

    const sql = hasRecord
      ? "update cpqs_p2" +
      " set cp2_wsibaccountnumber = @wsib_accountNumber," +
      " cp2_wsibfirmnumber = @wsib_firmNumber," +
      " cp2_wsibdate = @wsib_effectiveDate," +
      " cp2_wsibexpirydate = @wsib_expiryDate," +
      " cp2_isindependent = @wsib_isIndependent" +
      " where cp2_contractorid = @contractorID"
      : "insert into cpqs_p2" +
      " (cp2_contractorid, cp2_wsibaccountnumber, cp2_wsibfirmnumber, cp2_wsibdate, cp2_wsibexpirydate, cp2_isindependent, cp2_creationdate)" +
      " values (@contractorID, @wsib_accountNumber, @wsib_firmNumber, @wsib_effectiveDate, @wsib_expiryDate, @wsib_isIndependent, getdate())";

    await pool.request()
      .input("wsib_accountNumber", updateForm.wsib_accountNumber)
      .input("wsib_firmNumber", updateForm.wsib_firmNumber)
      .input("wsib_effectiveDate", effectiveDateString)
      .input("wsib_expiryDate", expiryDateString)
      .input("wsib_isIndependent", isIndependent)
      .input("contractorID", updateForm.contractorID)
      .query(sql);

    return true;

  } catch (error) {
    debugSQL(error);
  }

  return false;
};


export default updateWSIB;
