"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateInsurance_1 = require("../helpers/prequalDB/updateInsurance");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateInsurance_1.updateInsurance(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
