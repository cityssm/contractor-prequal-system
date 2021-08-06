import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFunctions from "../configFunctions.js";
import * as sqlFunctions from "../sqlFunctions.js";

import type * as sqlTypes from "mssql";
import type { Contractor } from "../../types/recordTypes";

import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getContractors");


export interface GetContractorFilters {
  contractorName?: string;
  tradeCategoryID?: number;
  isContractor?: boolean;
  wsibIsSatisfactory?: boolean;
  insuranceIsSatisfactory?: boolean;
  healthSafetyIsSatisfactory?: boolean;
  legalIsSatisfactory?: boolean;
  hasDocuShareCollectionID?: boolean;
  updateYears?: number;
}


const buildWhereClause = (filters: GetContractorFilters) => {

  let whereClause = "";

  if (Object.prototype.hasOwnProperty.call(filters, "isContractor")) {
    whereClause += " and isContractor = " + (filters.isContractor ? "1" : "0");
  }

  if (Object.prototype.hasOwnProperty.call(filters, "updateYears")) {
    whereClause += " and datediff(year, updateTime, getDate()) <= " + filters.updateYears.toString();
  }

  if (Object.prototype.hasOwnProperty.call(filters, "wsibIsSatisfactory")) {
    whereClause += " and wsib_isSatisfactory = " + (filters.wsibIsSatisfactory ? "1" : "0");
  }

  if (Object.prototype.hasOwnProperty.call(filters, "insuranceIsSatisfactory")) {
    whereClause += " and insurance_isSatisfactory = " + (filters.insuranceIsSatisfactory ? "1" : "0");
  }

  if (Object.prototype.hasOwnProperty.call(filters, "healthSafetyIsSatisfactory")) {
    whereClause += " and healthSafety_isSatisfactory = " + (filters.healthSafetyIsSatisfactory ? "1" : "0");
  }

  if (Object.prototype.hasOwnProperty.call(filters, "legalIsSatisfactory")) {
    whereClause += " and legal_isSatisfactory = " + (filters.legalIsSatisfactory ? "1" : "0");
  }

  if (Object.prototype.hasOwnProperty.call(filters, "hasDocuShareCollectionID")) {
    whereClause += filters.hasDocuShareCollectionID
      ? " and docuShareCollectionID is not null"
      : " and docuShareCollectionID is null";
  }

  if (Object.prototype.hasOwnProperty.call(filters, "tradeCategoryID")) {
    whereClause += " and contractorID in (select cp1b_contractorid from cpqs_p1_business where cp1b_typeid = '" + filters.tradeCategoryID.toString() + "')";
  }

  if (Object.prototype.hasOwnProperty.call(filters, "contractorName")) {
    const whereClausePiece = sqlFunctions.buildWhereClauseLike(["contractor_name"], filters.contractorName);
    if (whereClausePiece !== "") {
      whereClause += " and " + whereClausePiece;
    }
  }

  if (whereClause !== "") {
    whereClause = " where 1 = 1" + whereClause;
  }

  return whereClause;
};


export const getContractors = async (canUpdate: boolean, filters: GetContractorFilters): Promise<Contractor[]> => {

  try {
    const pool: sqlTypes.ConnectionPool =
      await sqlPool.connect(configFunctions.getProperty("mssqlConfig"));

    const sql = "select contractorID, docuShareCollectionID, isContractor," +
      " contractor_name, contractor_city, contractor_province," +
      " phone_name, phone_title," +
      (canUpdate
        ? " phone_number,"
        : " case when healthSafety_isSatisfactory = 1 and legal_isSatisfactory = 1 and wsib_isSatisfactory = 1 and insurance_isSatisfactory = 1 then phone_number else '' end as phone_number,") +
      " websiteURL," +
      " wsib_accountNumber, wsib_firmNumber, wsib_effectiveDate, wsib_expiryDate, wsib_isIndependent, wsib_isSatisfactory," +
      " insurance_company, insurance_policyNumber, insurance_amount, insurance_expiryDate, insurance_isSatisfactory," +
      " healthSafety_status, healthSafety_isSatisfactory," +
      " legal_note, legal_isSatisfactory" +
      " from Prequal.Contractor_SearchResults" +
      buildWhereClause(filters) +
      " order by contractor_name, contractorID";

    const contractorResult = await pool.request()
      .query(sql);

    if (!contractorResult.recordset) {
      return [];
    }

    const contractors = contractorResult.recordset as Contractor[];

    return contractors;

  } catch (error) {
    debugSQL(error);
  }

  return [];
};


export default getContractors;
