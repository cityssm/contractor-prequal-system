"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getTradeCategoriesByContractorID_1 = require("../helpers/prequalDB/getTradeCategoriesByContractorID");
;
const handler = async (req, res) => {
    const formFilters = req.body;
    const tradeCategories = await getTradeCategoriesByContractorID_1.getTradeCategoriesByContractorID(formFilters.contractorID);
    return res.json({
        tradeCategories
    });
};
exports.handler = handler;
