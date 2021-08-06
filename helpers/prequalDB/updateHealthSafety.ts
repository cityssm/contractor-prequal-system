import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";

import { hasHealthSafetyRecord } from "./hasHealthSafetyRecord.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateHealthSafety");


export interface HealthSafetyForm {
  contractorID: string;
  healthSafety_status: string;
}


export const updateHealthSafety = async (updateForm: HealthSafetyForm): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));

    const sql = (await hasHealthSafetyRecord(updateForm.contractorID))
      ? "update cpqs_pass" +
      " set cpass_status = @healthSafety_status" +
      " where cpass_contractorid = @contractorID"
      : "insert into cpqs_pass" +
      " (cpass_contractorid, cpass_status)" +
      " values (@contractorID, @healthSafety_status)";

    await pool.request()
      .input("healthSafety_status", updateForm.healthSafety_status)
      .input("contractorID", updateForm.contractorID)
      .query(sql);

    return true;

  } catch (error) {
    debugSQL(error);
  }

  return false;
};


export default updateHealthSafety;
