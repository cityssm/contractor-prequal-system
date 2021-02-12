import { getExpiredWSIBAccountNumbers } from "../helpers/prequalDB/getExpiredWSIBAccountNumbers";
import { updateWSIBExpiryDate } from "../helpers/prequalDB/updateWSIBExpiryDate";

import * as wsib from "@cityssm/wsib-clearance-check";

import * as configFns from "../helpers/configFns";

import { setIntervalAsync } from "set-interval-async/fixed";

import * as LocalStorage from "node-localstorage";

const accountNumbersToSkip = new LocalStorage.LocalStorage("./data/wsibRefreshCache");


const doTask = async () => {

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
        accountNumbersToSkip.setItem(accountNumber, accountNumber);
      }

    } catch (e) {
      configFns.logger.error(e);
      accountNumbersToSkip.setItem(accountNumber, accountNumber);
    }
  }
};


// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();


setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
