"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const removeTradeCategory_1 = require("../helpers/prequalDB/removeTradeCategory");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const formParams = req.body;
    const success = await removeTradeCategory_1.removeTradeCategory(formParams.contractorID, formParams.tradeCategoryID);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
