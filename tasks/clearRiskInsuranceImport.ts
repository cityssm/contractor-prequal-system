import * as fs from "fs";
import * as path from "path";

import * as configFns from "../helpers/configFns.js";
import { getContractor } from "../helpers/prequalDB/getContractor.js";
import { updateInsurance, InsuranceForm } from "../helpers/prequalDB/updateInsurance.js";

import * as chokidar from "chokidar";
import * as Papa from "papaparse";

import { setIntervalAsync } from "set-interval-async/fixed/index.js";

import debug from "debug";
const debugClearRisk = debug("contractor-prequal-system:clearRiskInsuranceImport");


const importFolderPath = configFns.getProperty("clearRiskConfig.insuranceImport.folderPath");
const columnNames = configFns.getProperty("clearRiskConfig.insuranceImport.columnNames");


const csvResultToInsuranceForm = async (csvResult: {}): Promise<InsuranceForm | false> => {

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


const processResults = async (results: Papa.ParseResult<Array<{}>>) => {

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


setIntervalAsync(doTask, 3 * 60 * 60 * 1000);
