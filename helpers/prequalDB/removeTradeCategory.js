"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTradeCategory = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const debug_1 = require("debug");
const debugSQL = debug_1.debug("contractor-prequal-system:prequalDB:removeTradeCategory");
const removeTradeCategory = (contractorID, tradeCategoryID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        yield pool.request()
            .input("contractorID", contractorID)
            .input("tradeCategoryID", tradeCategoryID)
            .query("delete from cpqs_p1_business" +
            " where cp1b_contractorid = @contractorID" +
            " and cp1b_typeid = @tradeCategoryID");
        return true;
    }
    catch (e) {
        debugSQL(e);
    }
    return false;
});
exports.removeTradeCategory = removeTradeCategory;
