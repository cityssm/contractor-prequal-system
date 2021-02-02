import { Router } from "express";


import { handler as handler_contractors } from "../handlers/contractors";
import { handler as handler_doGetContractors } from "../handlers/doGetContractors";


const router = Router();


router.get("/", handler_contractors);


router.post("/doGetContractors", handler_doGetContractors);


export = router;
