import * as path from "path";

import * as ds from "@cityssm/docushare";

import * as configFns from "../helpers/configFns";
import * as docuShareFns from "../helpers/docuShareFns";

import { clearCache } from "../helpers/queryResultsCache";

import { setIntervalAsync } from "set-interval-async/fixed";

import { getContractors } from "../helpers/prequalDB/getContractors";
import { updateContractor } from "../helpers/prequalDB/updateContractor";

/*
 * Setup DocuShare Connection
 */

ds.setupJava({
  dsapiPath: path.join("..", "..", "..", "java", "dsapi.jar")
});

ds.setupServer(configFns.getProperty("docuShareConfig.server"));

ds.setupSession(configFns.getProperty("docuShareConfig.session"));

/*
 * Task
 */

const checkSavedDocuShareCollectionIDs = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true
  });

  for (const contractor of contractors) {

    const contractorCollectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);

    try {

      const docuShareCollection = await ds.findByHandle(contractorCollectionHandle);

      if (docuShareCollection) {

        if (contractor.contractor_name !== docuShareCollection.title) {
          await ds.setTitle(contractorCollectionHandle, contractor.contractor_name);
        }

      } else {

        const success = await updateContractor({
          contractorID: contractor.contractorID,
          docuShareCollectionID: ""
        });

        if (success) {
          clearCache();
        }
      }

    } catch (e) {
      configFns.logger.error(e);
    }
  }
};

const doTask = async () => {
  await checkSavedDocuShareCollectionIDs();
};

/*
 * Schedule
 */

// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();

setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
