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
const getExpiredWSIBAccountNumbers_1 = require("../helpers/prequalDB/getExpiredWSIBAccountNumbers");
const updateWSIBExpiryDate_1 = require("../helpers/prequalDB/updateWSIBExpiryDate");
const wsib = require("@cityssm/wsib-clearance-check");
const configFns = require("../helpers/configFns");
const fixed_1 = require("set-interval-async/fixed");
const LocalStorage = require("node-localstorage");
const accountNumbersToSkip = new LocalStorage.LocalStorage("./data/wsibRefreshCache");
const doTask = () => __awaiter(void 0, void 0, void 0, function* () {
    const wsibAccountNumbers = yield getExpiredWSIBAccountNumbers_1.getExpiredWSIBAccountNumbers(50 + accountNumbersToSkip.length);
    for (const accountNumber of wsibAccountNumbers) {
        if (accountNumbersToSkip.getItem(accountNumber)) {
            continue;
        }
        try {
            const certificate = yield wsib.getClearanceByAccountNumber(accountNumber);
            if (certificate.success) {
                configFns.logger.debug(certificate);
                yield updateWSIBExpiryDate_1.updateWSIBExpiryDate(accountNumber, certificate.validityPeriodEnd);
            }
            else {
                configFns.logger.warn(JSON.stringify(certificate));
                accountNumbersToSkip.setItem(accountNumber, accountNumber);
            }
        }
        catch (e) {
            configFns.logger.error(e);
            accountNumbersToSkip.setItem(accountNumber, accountNumber);
        }
    }
});
doTask();
fixed_1.setIntervalAsync(doTask, 7200 * 1000);