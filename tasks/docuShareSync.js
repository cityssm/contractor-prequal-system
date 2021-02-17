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
const path = require("path");
const ds = require("@cityssm/docushare");
const configFns = require("../helpers/configFns");
const docuShareFns = require("../helpers/docuShareFns");
const queryResultsCache_1 = require("../helpers/queryResultsCache");
const fixed_1 = require("set-interval-async/fixed");
const getContractors_1 = require("../helpers/prequalDB/getContractors");
const updateContractor_1 = require("../helpers/prequalDB/updateContractor");
ds.setupJava({
    dsapiPath: path.join("..", "..", "..", "java", "dsapi.jar")
});
ds.setupServer(configFns.getProperty("docuShareConfig.server"));
ds.setupSession(configFns.getProperty("docuShareConfig.session"));
const checkSavedDocuShareCollectionIDs = () => __awaiter(void 0, void 0, void 0, function* () {
    const contractors = yield getContractors_1.getContractors(true, {
        hasDocuShareCollectionID: true
    });
    for (const contractor of contractors) {
        const contractorCollectionHandle = docuShareFns.getCollectionHandle(contractor.docuShareCollectionID);
        try {
            const docuShareCollection = yield ds.findByHandle(contractorCollectionHandle);
            if (docuShareCollection) {
                if (contractor.contractor_name !== docuShareCollection.title) {
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
        catch (e) {
            configFns.logger.error(e);
        }
    }
});
const doTask = () => __awaiter(void 0, void 0, void 0, function* () {
    yield checkSavedDocuShareCollectionIDs();
});
doTask();
fixed_1.setIntervalAsync(doTask, 2 * 60 * 60 * 1000);
