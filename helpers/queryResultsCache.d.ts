import type { Contractor } from "../types/recordTypes";
import type { GetContractorFilters } from "./prequalDB/getContractors";
export declare const clearCache: () => void;
export declare const getCachedResult: (canUpdate: boolean, filters: GetContractorFilters) => Contractor[] | false;
export declare const cacheResult: (canUpdate: boolean, filters: GetContractorFilters, result: Contractor[]) => void;
