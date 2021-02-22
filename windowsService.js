"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceConfig = void 0;
const path = require("path");
exports.serviceConfig = {
    name: "Contractor Prequal System",
    description: "A tool to assist City staff with hiring contractors that have been prequalified to work for the City.",
    script: path.join(__dirname, "bin", "www.js")
};
