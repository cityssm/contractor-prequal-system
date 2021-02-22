"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateContractor_1 = require("../helpers/prequalDB/updateContractor");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateContractor_1.updateContractor(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
