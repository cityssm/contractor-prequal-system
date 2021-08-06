import { getTradeCategories } from "../helpers/prequalDB/getTradeCategories.js";
export const handler = async (request, response) => {
    const tradeCategories = await getTradeCategories(!request.session.user.canUpdate);
    response.render("contractors", {
        tradeCategories
    });
};
export default handler;
