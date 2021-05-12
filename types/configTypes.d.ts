import type * as sqlTypes from "mssql";
import type * as dsTypes from "@cityssm/docushare/types";
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
    twoFactor?: {
        isEnabledInternally: boolean;
        isRequiredInternally: boolean;
        isEnabledExternally: boolean;
        isRequiredExternally: boolean;
        mssqlConfig: sqlTypes.config;
    };
    mssqlConfig: sqlTypes.config;
    adWebAuthConfig: ADWebAuthConfig;
    permissions: {
        canUpdate: string[];
    };
    docuShareConfig: {
        rootURL: string;
        contractorPrequalCollectionHandle: string;
        keyForms: Array<{
            formName: string;
            formURL: string;
        }>;
        server: dsTypes.ServerConfig;
        session: dsTypes.SessionConfig;
    };
    clearRiskConfig: {
        insuranceImport: {
            folderPath: string;
            columnNames: Config_ClearRisk_InsuranceImport_ColumnNames;
        };
    };
    vendorInformationSystemConfig: {
        vendorURL: string;
    };
}
export interface Config_HTTPSConfig {
    port: number;
    keyPath: string;
    certPath: string;
    passphrase?: string;
}
export interface Config_ClearRisk_InsuranceImport_ColumnNames {
    contractorID: string;
    expiryDate: string;
    company?: string;
    policyNumber?: string;
    amount?: string;
}
