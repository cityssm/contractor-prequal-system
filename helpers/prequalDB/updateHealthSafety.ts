import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import { hasHealthSafetyRecord } from "./hasHealthSafetyRecord";

import type * as sqlTypes from "mssql";


export interface HealthSafetyForm {
  contractorID: string;
  healthSafety_status: string;
}


export const updateHealthSafety = async (updateForm: HealthSafetyForm): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    let sql: string;

    if (await hasHealthSafetyRecord(updateForm.contractorID)) {
      sql = "update cpqs_pass" +
        " set cpass_status = @healthSafety_status" +
        " where cpass_contractorid = @contractorID";
    } else {
      sql = "insert into cpqs_pass" +
        " (cpass_contractorid, cpass_status)" +
        " values (@contractorID, @healthSafety_status)";
    }

    await pool.request()
      .input("healthSafety_status", updateForm.healthSafety_status)
      .input("contractorID", updateForm.contractorID)
      .query(sql);

    return true;

  } catch (e) {
    configFns.logger.error(e);
  }

  return false;
};
