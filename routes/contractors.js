"use strict";
const express_1 = require("express");
const doGetContractors_1 = require("../handlers/doGetContractors");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("contractors");
});
router.post("/doGetContractors", doGetContractors_1.handler);
module.exports = router;
