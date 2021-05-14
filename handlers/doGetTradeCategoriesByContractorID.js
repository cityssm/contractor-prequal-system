import getTradeCategoriesByContractorID from "../helpers/prequalDB/getTradeCategoriesByContractorID.js";
;
export const handler = async (req, res) => {
    const formFilters = req.body;
    const tradeCategories = await getTradeCategoriesByContractorID(formFilters.contractorID);
    return res.json({
        tradeCategories
    });
};
export default handler;
