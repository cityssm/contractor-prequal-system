import { getExpiredWSIBAccountNumbers } from "../helpers/prequalDB/getExpiredWSIBAccountNumbers";
import { updateWSIBExpiryDate } from "../helpers/prequalDB/updateWSIBExpiryDate";

import * as wsib from "@cityssm/wsib-clearance-check";

import * as configFns from "../helpers/configFns";

import { setIntervalAsync } from "set-interval-async/fixed";

import { LocalStorage } from "node-localstorage";


const accountNumbersToSkip = new LocalStorage("./data/wsibRefreshCache");

const refreshIntervalMillis = 2 * 60 * 60 * 1000;


const calculateCacheExpiry = (): number => {
  // Expiry three days in the future, spaced out by the regular refresh interval
  return Date.now() +
    (3 * 86400 * 1000) +
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

  const wsibAccountNumbers = await getExpiredWSIBAccountNumbers(50 + accountNumbersToSkip.length);

  for (const accountNumber of wsibAccountNumbers) {

    if (accountNumbersToSkip.getItem(accountNumber)) {
      continue;
    }

    try {
      const certificate = await wsib.getClearanceByAccountNumber(accountNumber);

      if (certificate.success) {
        configFns.logger.debug(certificate);
        await updateWSIBExpiryDate(accountNumber, certificate.validityPeriodEnd);
      } else {
        configFns.logger.warn(JSON.stringify(certificate));
        accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry().toString());
      }

    } catch (e) {
      configFns.logger.error(e);
      accountNumbersToSkip.setItem(accountNumber, calculateCacheExpiry().toString());
    }
  }
};


const doTask = async () => {
  purgeExpiredCacheEntries();
  await refreshWSIBDates();
};


// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();


setIntervalAsync(doTask, refreshIntervalMillis);
