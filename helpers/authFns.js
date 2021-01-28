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
exports.authenticate = void 0;
const configFns = require("./configFns");
const adWebAuth = require("@cityssm/ad-web-auth-connector");
const adWebAuthConfig = configFns.getProperty("adWebAuthConfig");
const userDomain = configFns.getProperty("application.userDomain");
adWebAuth.setConfig(adWebAuthConfig);
const authenticate = (userName, password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield adWebAuth.authenticate(userDomain + "\\" + userName, password);
});
exports.authenticate = authenticate;
