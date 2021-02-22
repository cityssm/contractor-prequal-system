"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addTradeCategory_1 = require("../helpers/prequalDB/addTradeCategory");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const formParams = req.body;
    const success = await addTradeCategory_1.addTradeCategory(formParams.contractorID, formParams.tradeCategoryID);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
