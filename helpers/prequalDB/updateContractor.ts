import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns";

import type * as sqlTypes from "mssql";


export interface ContractorForm {
  contractorID: string;
  docuShareCollectionID: string;
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
    configFns.logger.error(e);
  }

  return false;
};
