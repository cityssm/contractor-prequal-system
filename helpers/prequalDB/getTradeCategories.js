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
exports.getTradeCategories = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const getTradeCategories = (inUse) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        let sql = "";
        if (inUse) {
            sql = "select distinct tradeCategoryID, tradeCategory" +
                " from Prequal.Contractor_TradeCategories" +
                " order by tradeCategory";
        }
        else {
            sql = "select cbt_typeid as tradeCategoryID," +
                " cbt_type as tradeCategory" +
                " from cpqs_businesstypes" +
                " order by cbt_type";
        }
        const categoryResult = yield pool.request()
            .query(sql);
        if (!categoryResult.recordset) {
            return [];
        }
        const categories = categoryResult.recordset;
        return categories;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return [];
});
exports.getTradeCategories = getTradeCategories;
