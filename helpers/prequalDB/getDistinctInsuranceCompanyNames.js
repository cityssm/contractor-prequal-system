import * as sqlPool from "@cityssm/mssql-multi-pool";
import * as configFns from "../configFns.js";
import debug from "debug";
const debugSQL = debug("contractor-prequal-system:prequalDB:getDistinctInsuranceCompanyNames");
export const getDistinctInsuranceCompanyNames = async () => {
    try {
        const pool = await sqlPool.connect(configFns.getProperty("mssqlConfig"));
        const sql = "select distinct insurance_company" +
            " from Prequal.Contractor_SearchResults" +
            " where insurance_company is not null" +
            " and insurance_company != ''" +
            " order by insurance_company";
        const result = await pool.request().query(sql);
        if (!result.recordset) {
            return [];
        }
        const rawResults = result.recordset;
        const companyOptions = [];
        for (const rawResult of rawResults) {
            companyOptions.push(rawResult.insurance_company);
        }
        return companyOptions;
    }
    catch (e) {
        debugSQL(e);
    }
    return [];
};
