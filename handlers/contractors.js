import getTradeCategories from "../helpers/prequalDB/getTradeCategories.js";
export const handler = async (req, res) => {
    const tradeCategories = await getTradeCategories(!req.session.user.canUpdate);
    res.render("contractors", {
        tradeCategories
    });
};
export default handler;
