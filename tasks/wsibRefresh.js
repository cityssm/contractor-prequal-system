"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getExpiredWSIBAccountNumbers_1 = require("../helpers/prequalDB/getExpiredWSIBAccountNumbers");
const updateWSIBExpiryDate_1 = require("../helpers/prequalDB/updateWSIBExpiryDate");
const wsib = require("@cityssm/wsib-clearance-check");
const fixed_1 = require("set-interval-async/fixed");
const node_localstorage_1 = require("node-localstorage");
const debug_1 = require("debug");
const debugWSIB = debug_1.debug("contractor-prequal-system:wsibRefresh");
const accountNumbersToSkip = new node_localstorage_1.LocalStorage("./data/wsibRefreshCache");
const refreshIntervalMillis = 2 * 60 * 60 * 1000;
const calculateCacheExpiry = (dayMultiplier) => {
    return Date.now() +
        (dayMultiplier * 86400 * 1000) +
        (Math.random() * refreshIntervalMillis * 3);
};
const purgeExpiredCacheEntries = () => {
    const rightNowMillis = Date.now();
    for (let keyIndex = 0; keyIndex < accountNumbersToSkip.length; keyIndex += 1) {
        const accountNumber = accountNumbersToSkip.key(keyIndex);
        if (!accountNumber) {
            break;
        }
        const expiryTimeMillisString = accountNumbersToSkip.getItem(accountNumber);
        if (!expiryTimeMillisString) {
            accountNumbersToSkip.removeItem(accountNumber);
        }
        const expiryTimeMillis = parseInt(expiryTimeMillisString, 10);
        if (expiryTimeMillis < rightNowMillis) {
            accountNumbersToSkip.removeItem(accountNumber);
        }
    }
};
const refreshWSIBDates = async () => {
    const wsibAccountNumbers = await getExpiredWSIBAccountNumbers_1.getExpiredWSIBAccountNumbers(50 + accountNumbersToSkip.length);
    for (const accountNumber of wsibAccountNumbers) {
        if (accountNumbersToSkip.getItem(accountNumber)) {
            continue;
        }
        try {
            const certificate = await wsib.getClearanceByAccountNumber(accountNumber);
            if (certificate.success) {
                debugWSIB(certificate);
                await updateWSIBExpiryDate_1.updateWSIBExpiryDate(accountNumber, certificate.validityPeriodEnd);
            }
            else {
                debugWSIB(JSON.stringify(certificate));
                accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(3).toString());
            }
        }
        catch (e) {
            debugWSIB(e);
            accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(1).toString());
        }
    }
};
const doTask = async () => {
    purgeExpiredCacheEntries();
    await refreshWSIBDates();
};
doTask();
fixed_1.setIntervalAsync(doTask, refreshIntervalMillis);
