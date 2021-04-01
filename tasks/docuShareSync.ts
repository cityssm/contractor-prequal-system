import * as ds from "@cityssm/docushare";

import * as configFns from "../helpers/configFns";
import * as docuShareFns from "../helpers/docuShareFns";

import { clearCache } from "../helpers/queryResultsCache";

import { setIntervalAsync } from "set-interval-async/fixed";

import { getContractors } from "../helpers/prequalDB/getContractors";
import { updateContractor } from "../helpers/prequalDB/updateContractor";

import type * as recordTypes from "../types/recordTypes";

import { debug } from "debug";
const debugDocuShare = debug("contractor-prequal-system:docuShareSync");

const contractorPrequalCollectionHandle = configFns.getProperty("docuShareConfig.contractorPrequalCollectionHandle");

const recentlyModifiedMillis = 5 * 86400 * 1000;

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
 * Ensures that all contractors with valid health and safety, legal, and WSIB have Collections in DocuShare.
 */
const createHireReadyDocuShareCollections = async () => {

  const contractors = await getContractors(true, {
    healthSafetyIsSatisfactory: true,
    legalIsSatisfactory: true,
    wsibIsSatisfactory: true,
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
 * Purges empty Collections that haven't been modified recently.
 */
const purgeDocuShareCollections = async (contractors: recordTypes.Contractor[]) => {

  for (const contractor of contractors) {

    const collectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);

    const docuShareOutput = await ds.findByHandle(collectionHandle);

    if (!docuShareOutput.success || docuShareOutput.dsObjects.length === 0) {
      continue;

    } else if (docuShareOutput.dsObjects[0].modifiedDateMillis + recentlyModifiedMillis < Date.now()) {
      // Don't purge recently modified Collections.
      continue;
    }

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

const doTask = async () => {
  await createHireReadyDocuShareCollections();
  await purgeUnsatisfactoryLegalDocuShareCollections();
  await purgeUnsatisfactoryHealthSafetyDocuShareCollections();
  await checkSavedDocuShareCollectionIDs();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();

setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
