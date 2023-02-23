import * as fs from "fs";
import path from "path";

import * as configFunctions from "../helpers/configFunctions.js";
import { getContractor } from "../helpers/prequalDB/getContractor.js";
import { updateInsurance, InsuranceForm } from "../helpers/prequalDB/updateInsurance.js";

import * as chokidar from "chokidar";
import * as Papa from "papaparse";

import { setIntervalAsync, clearIntervalAsync } from "set-interval-async/fixed";
import exitHook from "exit-hook";

import debug from "debug";
const debugClearRisk = debug("contractor-prequal-system:clearRiskInsuranceImport");


const importFolderPath = configFunctions.getProperty("clearRiskConfig.insuranceImport.folderPath");
const columnNames = configFunctions.getProperty("clearRiskConfig.insuranceImport.columnNames");


const csvResultToInsuranceForm = async (csvResult: { [columnName: string]: string }): Promise<InsuranceForm | false> => {

  const contractorID = csvResult[columnNames.contractorID];

  if (!contractorID || contractorID === "") {
    // invalid, no contractor id
    return false;
  }

  const contractor = await getContractor(contractorID);

  if (!contractor) {
    // invalid, no contractor found
    return false;
  }

  const insurance_company = csvResult[columnNames.company] || "";
  const insurance_policyNumber = csvResult[columnNames.policyNumber] || "";
  const insurance_amount = csvResult[columnNames.amount] || "";
  const insurance_expiryDate = csvResult[columnNames.expiryDate] || "";

  const insuranceForm: InsuranceForm = {
    contractorID,
    insurance_company,
    insurance_policyNumber,
    insurance_amount,
    insurance_expiryDate
  };

  return insuranceForm;
};


const processResults = async (results: Papa.ParseResult<{ [columnName: string]: string }>) => {

  for (const csvResult of results.data) {

    const insuranceForm = await csvResultToInsuranceForm(csvResult);

    if (insuranceForm) {
      await updateInsurance(insuranceForm);
    }
  }
};


const validateAndParseFile = (fileName: string) => {

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


/*
 * Run the Task On Start
 */


// eslint-disable-next-line @typescript-eslint/no-floating-promises
doTask();


/*
 * Run the Task When New Files Are Written
 */


const watcher = chokidar.watch(importFolderPath, {
  awaitWriteFinish: true
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
watcher.on("add", doTask);


/*
 * Run the Task On A Regular Interval
 */


const intervalID = setIntervalAsync(doTask, 3 * 60 * 60 * 1000);

exitHook(() => {
  try {
    clearIntervalAsync(intervalID);
  } catch {
    // ignore
  }
});
