"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateWSIB_1 = require("../helpers/prequalDB/updateWSIB");
const resultsCache = require("../helpers/queryResultsCache");
const handler = async (req, res) => {
    const updateForm = req.body;
    const success = await updateWSIB_1.updateWSIB(updateForm);
    if (success) {
        resultsCache.clearCache();
    }
    return res.json({
        success
    });
};
exports.handler = handler;
