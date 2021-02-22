"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ds = require("@cityssm/docushare");
const configFns = require("../helpers/configFns");
const docuShareFns = require("../helpers/docuShareFns");
const queryResultsCache_1 = require("../helpers/queryResultsCache");
const fixed_1 = require("set-interval-async/fixed");
const getContractors_1 = require("../helpers/prequalDB/getContractors");
const updateContractor_1 = require("../helpers/prequalDB/updateContractor");
const debug_1 = require("debug");
const debugDocuShare = debug_1.debug("contractor-prequal-system:docuShareSync");
const contractorPrequalCollectionHandle = configFns.getProperty("docuShareConfig.contractorPrequalCollectionHandle");
docuShareFns.doSetup();
const checkSavedDocuShareCollectionIDs = async () => {
    const contractors = await getContractors_1.getContractors(true, {
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
                }
                else {
                    const success = await updateContractor_1.updateContractor({
                        contractorID: contractor.contractorID,
                        docuShareCollectionID: ""
                    });
                    if (success) {
                        queryResultsCache_1.clearCache();
                    }
                }
            }
        }
        catch (e) {
            debugDocuShare(e);
        }
    }
};
const createHireReadyDocuShareCollections = async () => {
    const contractors = await getContractors_1.getContractors(true, {
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
                await updateContractor_1.updateContractor({
                    contractorID: contractor.contractorID,
                    docuShareCollectionID: collectionID
                });
            }
        }
        catch (e) {
            debugDocuShare(e);
        }
    }
};
const purgeDocuShareCollections = async (contractors) => {
    for (const contractor of contractors) {
        const collectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);
        const docuShareOutput = await ds.findByHandle(collectionHandle);
        if (!docuShareOutput.success || docuShareOutput.dsObjects.length === 0) {
            continue;
        }
        else if (docuShareOutput.dsObjects[0].modifiedDateMillis + (2 * 86400 * 1000) < Date.now()) {
            continue;
        }
        const docuShareChildrenOutput = await ds.getChildren(collectionHandle);
        if (docuShareChildrenOutput.success && docuShareChildrenOutput.dsObjects.length === 0) {
            const success = await ds.deleteObject(collectionHandle);
            if (success) {
                await updateContractor_1.updateContractor({
                    contractorID: contractor.contractorID,
                    docuShareCollectionID: ""
                });
            }
        }
    }
};
const purgeUnsatisfactoryLegalDocuShareCollections = async () => {
    const contractors = await getContractors_1.getContractors(true, {
        hasDocuShareCollectionID: true,
        legalIsSatisfactory: false
    });
    await purgeDocuShareCollections(contractors);
};
const purgeUnsatisfactoryHealthSafetyDocuShareCollections = async () => {
    const contractors = await getContractors_1.getContractors(true, {
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
doTask();
fixed_1.setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
