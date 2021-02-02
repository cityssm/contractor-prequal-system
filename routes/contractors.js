"use strict";
const express_1 = require("express");
const contractors_1 = require("../handlers/contractors");
const doGetContractors_1 = require("../handlers/doGetContractors");
const router = express_1.Router();
router.get("/", contractors_1.handler);
router.post("/doGetContractors", doGetContractors_1.handler);
module.exports = router;
