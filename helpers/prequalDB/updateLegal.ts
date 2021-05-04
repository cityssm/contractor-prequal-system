import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";
import type * as express from "express-session";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateLegal");


export interface LegalForm {
  contractorID: string;
  legal_isSatisfactory: "1" | "0";
}


export const updateLegal = async (updateForm: LegalForm, reqSession: express.Session): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    await pool.request()
      .input("legal_isSatisfactory", updateForm.legal_isSatisfactory === "1" ? 1 : 0)
      .input("legal_updateTime", new Date())
      .input("legal_updateUser", reqSession.user.userName)
      .input("contractorID", updateForm.contractorID)
      .query("update cpqs_contractors" +
        " set cc_legal_issatisfactory = @legal_isSatisfactory," +
        " cc_legal_updatetime = @legal_updateTime," +
        " cc_legal_updateuser = @legal_updateUser" +
        " where cc_contractorid = @contractorID");

    return true;

  } catch (e) {
    debugSQL(e);
  }

  return false;
};
