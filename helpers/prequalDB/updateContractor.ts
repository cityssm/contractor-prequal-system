import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";

import type * as sqlTypes from "mssql";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:updateContractor");


export interface ContractorForm {
  contractorID: string | number;
  docuShareCollectionID: string | number;
}


export const updateContractor = async (updateForm: ContractorForm): Promise<boolean> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFns.getProperty("mssqlConfig"));

    await pool.request()
      .input("docuShareCollectionID", updateForm.docuShareCollectionID === "" ? null : updateForm.docuShareCollectionID)
      .input("contractorID", updateForm.contractorID)
      .query("update cpqs_contractors" +
        " set cc_docusharecollectionid = @docuShareCollectionID" +
        " where cc_contractorid = @contractorID");

    return true;

  } catch (e) {
    debugSQL(e);
  }

  return false;
};


export default updateContractor;
