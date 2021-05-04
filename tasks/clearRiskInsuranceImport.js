import * as fs from "fs";
import * as path from "path";
import * as configFns from "../helpers/configFns.js";
import { getContractor } from "../helpers/prequalDB/getContractor.js";
import { updateInsurance } from "../helpers/prequalDB/updateInsurance.js";
import * as chokidar from "chokidar";
import * as Papa from "papaparse";
import { setIntervalAsync } from "set-interval-async/fixed/index.js";
import debug from "debug";
const debugClearRisk = debug("contractor-prequal-system:clearRiskInsuranceImport");
const importFolderPath = configFns.getProperty("clearRiskConfig.insuranceImport.folderPath");
const columnNames = configFns.getProperty("clearRiskConfig.insuranceImport.columnNames");
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
setIntervalAsync(doTask, 3 * 60 * 60 * 1000);
