import { getTradeCategories } from "../helpers/prequalDB/getTradeCategories.js";
export const handler = async (_request, response) => {
    const tradeCategories = await getTradeCategories(false);
    return response.json({
        tradeCategories
    });
};
export default handler;
