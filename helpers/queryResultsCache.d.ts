import type { Contractor } from '../types/recordTypes';
export declare const clearCache: () => void;
export declare const getCachedResult: (canUpdate: boolean, filters: GetContractorFilters) => Contractor[] | false;
export declare const cacheResult: (canUpdate: boolean, filters: GetContractorFilters, result: Contractor[]) => void;
