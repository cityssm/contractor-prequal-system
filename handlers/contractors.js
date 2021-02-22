"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getTradeCategories_1 = require("../helpers/prequalDB/getTradeCategories");
const handler = async (req, res) => {
    const tradeCategories = await getTradeCategories_1.getTradeCategories(!req.session.user.canUpdate);
    res.render("contractors", {
        tradeCategories
    });
};
exports.handler = handler;
