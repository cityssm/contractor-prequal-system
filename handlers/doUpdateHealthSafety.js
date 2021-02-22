"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateHealthSafety_1 = require("../helpers/prequalDB/updateHealthSafety");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateHealthSafety_1.updateHealthSafety(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
