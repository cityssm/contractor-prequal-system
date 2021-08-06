import { getDistinctInsuranceCompanyNames } from "../helpers/prequalDB/getDistinctInsuranceCompanyNames.js";
export const handler = async (_request, response) => {
    const insuranceCompanyNames = await getDistinctInsuranceCompanyNames();
    return response.json({
        insuranceCompanyNames
    });
};
export default handler;
