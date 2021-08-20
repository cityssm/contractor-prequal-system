import { getExpiredWSIBAccountNumbers } from "../helpers/prequalDB/getExpiredWSIBAccountNumbers.js";
import { updateWSIBExpiryDate } from "../helpers/prequalDB/updateWSIBExpiryDate.js";

import * as wsib from "@cityssm/wsib-clearance-check";

import { setIntervalAsync, clearIntervalAsync } from "set-interval-async/fixed/index.js";
import exitHook from "exit-hook";

import { LocalStorage } from "node-localstorage";

import debug from "debug";
const debugWSIB = debug("contractor-prequal-system:wsibRefresh");


const accountNumbersToSkip = new LocalStorage("./data/wsibRefreshCache");

const refreshIntervalMillis = 2 * 60 * 60 * 1000;


const calculateCacheExpiry = (dayMultiplier: number): number => {
  // Expiry three days in the future, spaced out by the regular refresh interval
  return Date.now() +
    (dayMultiplier * 86_400 * 1000) +
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
      } else {
        debugWSIB(JSON.stringify(certificate));
        accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(3).toString());
      }

    } catch (error) {
      debugWSIB(error);
      accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry(1).toString());
    }
  }
};


const doTask = async () => {
  purgeExpiredCacheEntries();
  await refreshWSIBDates();
};


// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();


const intervalID = setIntervalAsync(doTask, refreshIntervalMillis);

exitHook(() => {
  try {
    clearIntervalAsync(intervalID);
  } catch {
    // ignore
  }
});
