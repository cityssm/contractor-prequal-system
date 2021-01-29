import { Router } from "express";


import { handler as handler_doGetContractors } from "../handlers/doGetContractors";


const router = Router();


router.get("/", (_req, res) => {
  res.render("contractors");
});


router.post("/doGetContractors", handler_doGetContractors);


export = router;
