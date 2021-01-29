import type { RequestHandler } from "express";


interface FormFilters {
  productSKU: string;
  orderStatus: "" | "unpaid" | "paid" | "refunded";
  orderTimeMaxAgeDays: "" | "10" | "30" | "60" | "90";
};


export const handler: RequestHandler = async (req, res) => {

  const contractors = {}; // await getContractors(queryFilters);

  return res.json({
    contractors
  });

};
