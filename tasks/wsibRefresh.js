import { getExpiredWSIBAccountNumbers } from "../helpers/prequalDB/getExpiredWSIBAccountNumbers.js";
import { updateWSIBExpiryDate } from "../helpers/prequalDB/updateWSIBExpiryDate.js";
import * as wsib from "@cityssm/wsib-clearance-check";
import { setIntervalAsync } from "set-interval-async/fixed/index.js";
import { LocalStorage } from "node-localstorage";
import debug from "debug";
const debugWSIB = debug("contractor-prequal-system:wsibRefresh");
const accountNumbersToSkip = new LocalStorage("./data/wsibRefreshCache");
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
        const expiryTimeMillis = Number.parseInt(expiryTimeMillisString, 10);
        if (expiryTimeMillis < rightNowMillis) {
            accountNumbersToSkip.removeItem(accountNumber);
        }
    }
};
const refreshWSIBDates = async () => {
    const wsibAccountNumbers = await getExpiredWSIBAccountNumbers(50 + accountNumbersToSkip.length);
    for (const accountNumber of wsibAccountNumbers) {
        if (accountNumbersToSkip.getItem(accountNumber)) {
            continue;
        }
        try {
            const certificate = await wsib.getClearanceByAccountNumber(accountNumber);
            if (certificate.success) {
                debugWSIB(certificate);
                await updateWSIBExpiryDate(accountNumber, certificate.validityPeriodEnd);
            }
            else {
                debugWSIB(JSON.stringify(certificate));
                accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(3).toString());
            }
        }
        catch (error) {
            debugWSIB(error);
            accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(1).toString());
        }
    }
};
const doTask = async () => {
    purgeExpiredCacheEntries();
    await refreshWSIBDates();
};
doTask();
setIntervalAsync(doTask, refreshIntervalMillis);
