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
exports.handler = void 0;
const updateInsurance_1 = require("../helpers/prequalDB/updateInsurance");
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateForm = req.body;
    const success = yield updateInsurance_1.updateInsurance(updateForm);
    return res.json({
        success
    });
});
exports.handler = handler;
