import getTradeCategories from "../helpers/prequalDB/getTradeCategories.js";
export const handler = async (_req, res) => {
    const tradeCategories = await getTradeCategories(false);
    return res.json({
        tradeCategories
    });
};
export default handler;
