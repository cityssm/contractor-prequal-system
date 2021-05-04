import { getDistinctInsuranceCompanyNames } from "../helpers/prequalDB/getDistinctInsuranceCompanyNames.js";
export const handler = async (_req, res) => {
    const insuranceCompanyNames = await getDistinctInsuranceCompanyNames();
    return res.json({
        insuranceCompanyNames
    });
};
