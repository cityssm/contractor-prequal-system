import * as ds from "@cityssm/docushare";

import * as configFns from "../helpers/configFns.js";
import * as docuShareFns from "../helpers/docuShareFns.js";

import { clearCache } from "../helpers/queryResultsCache.js";

import { setIntervalAsync } from "set-interval-async/fixed/index.js";

import { getContractors } from "../helpers/prequalDB/getContractors.js";
import { updateContractor } from "../helpers/prequalDB/updateContractor.js";

import type * as recordTypes from "../types/recordTypes";

import debug from "debug";
const debugDocuShare = debug("contractor-prequal-system:docuShareSync");

const contractorPrequalCollectionHandle = configFns.getProperty("docuShareConfig.contractorPrequalCollectionHandle");

const recentlyModifiedYears = 1;
const recentlyModifiedMillis = recentlyModifiedYears * 365 * 86400 * 1000;

/*
 * Setup DocuShare Connection
 */

docuShareFns.doSetup();

/*
 * Tasks
 */

/**
 * Checks all contractors with docuShareCollectionIDs
 * - If the Collection exists, make sure the title of the Collection matches the name of the contractor.
 * - If the Collection does not exist, blank out the docuShareCollectionID.
 */
const checkSavedDocuShareCollectionIDs = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true
  });

  for (const contractor of contractors) {

    const contractorCollectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);

    try {

      const docuShareOutput = await ds.findByHandle(contractorCollectionHandle);

      if (docuShareOutput.success) {

        if (docuShareOutput.dsObjects.length > 0) {

          if (contractor.contractor_name !== docuShareOutput.dsObjects[0].title) {
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
      }

    } catch (e) {
      debugDocuShare(e);
    }
  }
};

/**
 * Ensures that all contractors have Collections in DocuShare.
 */
const createDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    isContractor: true,
    updateYears: recentlyModifiedYears,
    hasDocuShareCollectionID: false
  });

  for (const contractor of contractors) {

    try {

      const docuShareOutput = await ds.createCollection(contractorPrequalCollectionHandle, contractor.contractor_name);

      if (docuShareOutput.success) {

        const collectionID = docuShareOutput.dsObjects[0].handle.split("-")[1];

        await updateContractor({
          contractorID: contractor.contractorID,
          docuShareCollectionID: collectionID
        });
      }

    } catch (e) {
      debugDocuShare(e);
    }
  }
};

/**
 * Purges empty Collections that are empty and haven't been modified recently.
 */
const purgeDocuShareCollections = async (contractors: recordTypes.Contractor[]) => {

  for (const contractor of contractors) {

    const collectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);

    const docuShareOutput = await ds.findByHandle(collectionHandle);

    if (!docuShareOutput.success || docuShareOutput.dsObjects.length === 0) {
      continue;

    } else if (docuShareOutput.dsObjects[0].modifiedDateMillis + recentlyModifiedMillis > Date.now()) {
      // Don't purge recently modified Collections.
      continue;
    }

    debugDocuShare("about to purge");
    debugDocuShare(docuShareOutput);

    const docuShareChildrenOutput = await ds.getChildren(collectionHandle);

    if (docuShareChildrenOutput.success && docuShareChildrenOutput.dsObjects.length === 0) {

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

/**
 * Purges empty Collections with unsatisfactory Legal requirements.
 */
const purgeUnsatisfactoryLegalDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true,
    legalIsSatisfactory: false
  });

  await purgeDocuShareCollections(contractors);
};

/**
 * Purges empty Collections with unsatisfactory Health and Safety requirements.
 */
const purgeUnsatisfactoryHealthSafetyDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    hasDocuShareCollectionID: true,
    healthSafetyIsSatisfactory: false
  });

  await purgeDocuShareCollections(contractors);
};

/*
 * Schedule
 */

let taskIsRunning = false;
let taskIsQueued = false;

const doTask = async () => {

  taskIsQueued = false;
  taskIsRunning = true;

  debugDocuShare("Task starting.");
  await createDocuShareCollections();
  await purgeUnsatisfactoryLegalDocuShareCollections();
  await purgeUnsatisfactoryHealthSafetyDocuShareCollections();
  await checkSavedDocuShareCollectionIDs();
  debugDocuShare("Task finished.");
  taskIsRunning = false;

  if (taskIsQueued) {
    taskIsQueued = false;
    await doTask();
  }
};

const queueTask = () => {

  if (taskIsRunning) {
    taskIsQueued = true;
  } else {
    doTask();
  }
};

queueTask();

setIntervalAsync(async () => {
  queueTask();
}, 2 * 60 * 60 * 1000);

/*
 * Listener
 */

process.on("message", () => {
  debugDocuShare("Task queued.");
  queueTask();
});
