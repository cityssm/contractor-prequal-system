import * as path from "path";
import type { ServiceConfig } from "node-windows";


const __dirname = ".";

export const serviceConfig: ServiceConfig = {
  name: "Contractor Prequal System",
  description: "A tool to assist City staff with hiring contractors that have been prequalified to work for the City.",
  script: path.join(__dirname, "bin", "www.js")
};
