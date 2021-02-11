import type { Contractor } from "../../types/recordTypes";
export interface GetContractorFilters {
    contractorName?: string;
    tradeCategoryID?: number;
    isContractor?: boolean;
    wsibIsSatisfactory?: boolean;
    insuranceIsSatisfactory?: boolean;
    healthSafetyIsSatisfactory?: boolean;
    legalIsSatisfactory?: boolean;
}
export declare const getContractors: (canUpdate: boolean, filters: GetContractorFilters) => Promise<Contractor[]>;
