"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateLegal_1 = require("../helpers/prequalDB/updateLegal");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateLegal_1.updateLegal(updateForm, req.session);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
