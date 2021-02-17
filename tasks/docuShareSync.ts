import * as path from "path";

import * as ds from "@cityssm/docushare";

import * as configFns from "../helpers/configFns";
import * as docuShareFns from "../helpers/docuShareFns";

import { clearCache } from "../helpers/queryResultsCache";

import { setIntervalAsync } from "set-interval-async/fixed";

import { getContractors } from "../helpers/prequalDB/getContractors";
import { updateContractor } from "../helpers/prequalDB/updateContractor";

import type * as recordTypes from "../types/recordTypes";

const contractorPrequalCollectionHandle = configFns.getProperty("docuShareConfig.contractorPrequalCollectionHandle");

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

const createHireReadyDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    healthSafetyIsSatisfactory: true,
    legalIsSatisfactory: true,
    wsibIsSatisfactory: true,
    hasDocuShareCollectionID: false
  });

  for (const contractor of contractors) {

    try {

      const docuShareCollection = await ds.createCollection(contractorPrequalCollectionHandle, contractor.contractor_name);

      if (docuShareCollection) {

        const collectionID = docuShareCollection.handle.split("-")[1];

        await updateContractor({
          contractorID: contractor.contractorID,
          docuShareCollectionID: collectionID
        });
      }

    } catch (e) {
      configFns.logger.error(e);
    }
  }
};

const purgeDocuShareCollections = async (contractors: recordTypes.Contractor[]) => {

  for (const contractor of contractors) {

    const collectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);

    const collectionChildren = await ds.getChildren(collectionHandle);

    if (collectionChildren && collectionChildren.length === 0) {

      const success = await ds.deleteObject(collectionHandle);

      if (success) {
        await updateContractor({
          contractorID: contractor.contractorID,
          docuShareCollectionID: ""
        });
      }
    }
  }
};

const purgeUnsatisfactoryLegalDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true,
    legalIsSatisfactory: false
  });

  await purgeDocuShareCollections(contractors);
};

const purgeUnsatisfactoryHealthSafetyDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true,
    healthSafetyIsSatisfactory: false
  });

  await purgeDocuShareCollections(contractors);
};

const doTask = async () => {
  await createHireReadyDocuShareCollections();
  await purgeUnsatisfactoryLegalDocuShareCollections();
  await purgeUnsatisfactoryHealthSafetyDocuShareCollections();
  await checkSavedDocuShareCollectionIDs();
};

/*
 * Schedule
 */

// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();

setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
