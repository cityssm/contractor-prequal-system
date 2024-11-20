import * as fs from "fs";
import path from "path";
import * as configFunctions from "../helpers/configFunctions.js";
import { getContractor } from "../helpers/prequalDB/getContractor.js";
import { updateInsurance } from "../helpers/prequalDB/updateInsurance.js";
import * as chokidar from "chokidar";
import * as Papa from "papaparse";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async/fixed";
import exitHook from "exit-hook";
import debug from "debug";
const debugClearRisk = debug("contractor-prequal-system:clearRiskInsuranceImport");
const importFolderPath = configFunctions.getProperty("clearRiskConfig.insuranceImport.folderPath");
const columnNames = configFunctions.getProperty("clearRiskConfig.insuranceImport.columnNames");
const csvResultToInsuranceForm = async (csvResult) => {
    const contractorID = csvResult[columnNames.contractorID];
    if (!contractorID || contractorID === "") {
        return false;
    }
    const contractor = await getContractor(contractorID);
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
            await updateInsurance(insuranceForm);
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
    fs.unlink(filePath, (error) => {
        if (error) {
            debugClearRisk(error.message);
        }
    });
};
const doTask = async () => {
    fs.readdir(importFolderPath, (error, files) => {
        if (error) {
            debugClearRisk(error.message);
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
const intervalID = setIntervalAsync(doTask, 3 * 60 * 60 * 1000);
exitHook(() => {
    try {
        clearIntervalAsync(intervalID);
    }
    catch {
    }
});
