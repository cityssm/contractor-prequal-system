import type * as sqlTypes from "mssql";
import type { ADWebAuthConfig } from "@cityssm/ad-web-auth-connector/types";


export interface Config {

  application?: {
    httpPort?: number;
    https?: Config_HTTPSConfig;
    userDomain?: string;
  };

  reverseProxy?: {
    disableCompression: boolean;
    disableEtag: boolean;
    blockViaXForwardedFor: boolean;
    urlPrefix: string;
  };

  session?: {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
  };

  mssqlConfig: sqlTypes.config;

  adWebAuthConfig: ADWebAuthConfig;

  permissions?: {
    canUpdate: string[];
  };

  docuShareConfig?: {
    rootURL: string;
    contractorPrequalURL: string;
    healthSafetyURL: string;
  };

  vendorInformationSystemConfig?: {
    vendorURL: string;
  };
}

export interface Config_HTTPSConfig {
  port: number;
  keyPath: string;
  certPath: string;
  passphrase?: string;
}
