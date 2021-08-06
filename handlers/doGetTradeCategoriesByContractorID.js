import { getTradeCategoriesByContractorID } from "../helpers/prequalDB/getTradeCategoriesByContractorID.js";
export const handler = async (request, response) => {
    const formFilters = request.body;
    const tradeCategories = await getTradeCategoriesByContractorID(formFilters.contractorID);
    return response.json({
        tradeCategories
    });
};
export default handler;
