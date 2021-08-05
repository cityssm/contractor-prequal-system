import type { Contractor } from "../../types/recordTypes";
export interface GetContractorFilters {
    contractorName?: string;
    tradeCategoryID?: number;
    isContractor?: boolean;
    wsibIsSatisfactory?: boolean;
    insuranceIsSatisfactory?: boolean;
    healthSafetyIsSatisfactory?: boolean;
    legalIsSatisfactory?: boolean;
    hasDocuShareCollectionID?: boolean;
    updateYears?: number;
}
export declare const getContractors: (canUpdate: boolean, filters: GetContractorFilters) => Promise<Contractor[]>;
export default getContractors;
