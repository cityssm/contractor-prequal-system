"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getTradeCategories_1 = require("../helpers/prequalDB/getTradeCategories");
const handler = async (_req, res) => {
    const tradeCategories = await getTradeCategories_1.getTradeCategories(false);
    return res.json({
        tradeCategories
    });
};
exports.handler = handler;
