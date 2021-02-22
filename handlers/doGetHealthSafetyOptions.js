"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getHealthSafetyStatusOptions_1 = require("../helpers/prequalDB/getHealthSafetyStatusOptions");
const handler = async (_req, res) => {
    const healthSafetyStatuses = await getHealthSafetyStatusOptions_1.getHealthSafetyStatusOptions();
    return res.json({
        healthSafetyStatuses
    });
};
exports.handler = handler;
