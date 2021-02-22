"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const configFns = require("../helpers/configFns");
const getContractor_1 = require("../helpers/prequalDB/getContractor");
const updateInsurance_1 = require("../helpers/prequalDB/updateInsurance");
const chokidar = require("chokidar");
const Papa = require("papaparse");
const fixed_1 = require("set-interval-async/fixed");
const debug_1 = require("debug");
const debugClearRisk = debug_1.debug("contractor-prequal-system:clearRiskInsuranceImport");
const importFolderPath = configFns.getProperty("clearRiskConfig.insuranceImport.folderPath");
const columnNames = configFns.getProperty("clearRiskConfig.insuranceImport.columnNames");
const csvResultToInsuranceForm = async (csvResult) => {
    const contractorID = csvResult[columnNames.contractorID];
    if (!contractorID || contractorID === "") {
        return false;
    }
    const contractor = await getContractor_1.getContractor(contractorID);
    if (!contractor) {
        return false;
    }
    const insurance_company = csvResult[columnNames.company] || "";
    const insurance_policyNumber = csvResult[columnNames.policyNumber] || "";
    const insurance_amount = csvResult[columnNames.amount] || "";
    const insurance_expiryDate = csvResult[columnNames.expiryDate] || "";
    const insuranceForm = {
        contractorID,
        insurance_company,
        insurance_policyNumber,
        insurance_amount,
        insurance_expiryDate
    };
    return insuranceForm;
};
const processResults = async (results) => {
    for (const csvResult of results.data) {
        const insuranceForm = await csvResultToInsuranceForm(csvResult);
        if (insuranceForm) {
            await updateInsurance_1.updateInsurance(insuranceForm);
        }
    }
};
const validateAndParseFile = (fileName) => {
    const filePath = path.join(importFolderPath, fileName);
    Papa.parse(fs.createReadStream(filePath), {
        header: true,
        skipEmptyLines: "greedy",
        complete: processResults
    });
    fs.unlink(filePath, (err) => {
        if (err) {
            debugClearRisk(err.message);
        }
    });
};
const doTask = async () => {
    fs.readdir(importFolderPath, (err, files) => {
        if (err) {
            debugClearRisk(err.message);
            return;
        }
        files.forEach(validateAndParseFile);
    });
};
doTask();
const watcher = chokidar.watch(importFolderPath, {
    awaitWriteFinish: true
});
watcher.on("add", doTask);
fixed_1.setIntervalAsync(doTask, 3 * 60 * 60 * 1000);
