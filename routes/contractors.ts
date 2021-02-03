import { Router } from "express";


import { handler as handler_contractors } from "../handlers/contractors";
import { handler as handler_doGetContractors } from "../handlers/doGetContractors";
import { handler as handler_doGetTradeCategoriesByContractorID } from "../handlers/doGetTradeCategoriesByContractorID";


const router = Router();


router.get("/", handler_contractors);


router.post("/doGetContractors", handler_doGetContractors);


router.post("/doGetTradeCategoriesByContractorID", handler_doGetTradeCategoriesByContractorID);


export = router;
