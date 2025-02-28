import type { Contractor } from '../../types/recordTypes';
export interface GetContractorFilters {
    contractorName?: string;
    tradeCategoryID?: number;
    hireStatus?: 'hireReady' | 'cityApproved' | 'partiallyApproved' | '';
    isContractor?: boolean;
    hasDocuShareCollectionID?: boolean;
    updateYears?: number;
}
export declare const getContractors: (canUpdate: boolean, filters: GetContractorFilters) => Promise<Contractor[]>;
export default getContractors;
