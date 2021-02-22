"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const checkSavedDocuShareCollectionIDs = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractors = yield getContractors_1.getContractors(true, {
        hasDocuShareCollectionID: true
    });
    for (const contractor of contractors) {
        const contractorCollectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);
        try {
            const docuShareOutput = yield ds.findByHandle(contractorCollectionHandle);
            if (docuShareOutput.success) {
                if (docuShareOutput.dsObjects.length > 0) {
                    if (contractor.contractor_name !== docuShareOutput.dsObjects[0].title) {
                        yield ds.setTitle(contractorCollectionHandle, contractor.contractor_name);
                    }
                }
                else {
                    const success = yield updateContractor_1.updateContractor({
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
});
const createHireReadyDocuShareCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractors = yield getContractors_1.getContractors(true, {
        healthSafetyIsSatisfactory: true,
        legalIsSatisfactory: true,
        wsibIsSatisfactory: true,
        hasDocuShareCollectionID: false
    });
    for (const contractor of contractors) {
        try {
            const docuShareOutput = yield ds.createCollection(contractorPrequalCollectionHandle, contractor.contractor_name);
            if (docuShareOutput.success) {
                const collectionID = docuShareOutput.dsObjects[0].handle.split("-")[1];
                yield updateContractor_1.updateContractor({
                    contractorID: contractor.contractorID,
                    docuShareCollectionID: collectionID
                });
            }
        }
        catch (e) {
            debugDocuShare(e);
        }
    }
});
const purgeDocuShareCollections = (contractors) => __awaiter(void 0, void 0, void 0, function* () {
    for (const contractor of contractors) {
        const collectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);
        const docuShareOutput = yield ds.findByHandle(collectionHandle);
        if (!docuShareOutput.success || docuShareOutput.dsObjects.length === 0) {
            continue;
        }
        else if (docuShareOutput.dsObjects[0].modifiedDateMillis + (2 * 86400 * 1000) < Date.now()) {
            continue;
        }
        const docuShareChildrenOutput = yield ds.getChildren(collectionHandle);
        if (docuShareChildrenOutput.success && docuShareChildrenOutput.dsObjects.length === 0) {
            const success = yield ds.deleteObject(collectionHandle);
            if (success) {
                yield updateContractor_1.updateContractor({
                    contractorID: contractor.contractorID,
                    docuShareCollectionID: ""
                });
            }
        }
    }
});
const purgeUnsatisfactoryLegalDocuShareCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractors = yield getContractors_1.getContractors(true, {
        hasDocuShareCollectionID: true,
        legalIsSatisfactory: false
    });
    yield purgeDocuShareCollections(contractors);
});
const purgeUnsatisfactoryHealthSafetyDocuShareCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractors = yield getContractors_1.getContractors(true, {
        hasDocuShareCollectionID: true,
        healthSafetyIsSatisfactory: false
    });
    yield purgeDocuShareCollections(contractors);
});
const doTask = () => __awaiter(void 0, void 0, void 0, function* () {
    yield createHireReadyDocuShareCollections();
    yield purgeUnsatisfactoryLegalDocuShareCollections();
    yield purgeUnsatisfactoryHealthSafetyDocuShareCollections();
    yield checkSavedDocuShareCollectionIDs();
});
doTask();
fixed_1.setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
