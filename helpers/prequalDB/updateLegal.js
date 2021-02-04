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
exports.updateLegal = void 0;
const sqlPool = require("@cityssm/mssql-multi-pool");
const configFns = require("../configFns");
const updateLegal = (updateForm, reqSession) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield sqlPool.connect(configFns.getProperty("mssqlConfig"));
        yield pool.request()
            .input("legal_isSatisfactory", updateForm.legal_isSatisfactory === "1" ? 1 : 0)
            .input("legal_updateTime", new Date())
            .input("legal_updateUser", reqSession.user.userName)
            .input("contractorID", updateForm.contractorID)
            .query("update cpqs_contractors" +
            " set cc_legal_issatisfactory = @legal_isSatisfactory," +
            " cc_legal_updatetime = @legal_updateTime," +
            " cc_legal_updateuser = @legal_updateUser" +
            " where cc_contractorid = @contractorID");
        return true;
    }
    catch (e) {
        configFns.logger.error(e);
    }
    return false;
});
exports.updateLegal = updateLegal;
