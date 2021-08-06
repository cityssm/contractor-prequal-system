import NodeCache from "node-cache";

import type { Contractor } from "../types/recordTypes";
import type { GetContractorFilters } from "./prequalDB/getContractors";


const cache: NodeCache = new NodeCache({
  stdTTL: 60 * 60,
  useClones: false,
  maxKeys: 50
});


const getCacheKey = (canUpdate: boolean, filters: GetContractorFilters): string => {
  return canUpdate.toString() + ":" + JSON.stringify(filters);
};


export const clearCache = (): void => {
  cache.flushAll();
};


export const getCachedResult = (canUpdate: boolean, filters: GetContractorFilters): Contractor[] | false => {

  const cacheKey = getCacheKey(canUpdate, filters);

  const result: Contractor[] = cache.get(cacheKey);

  if (!result) {
    return false;
  }

  return result;
};


export const cacheResult = (canUpdate: boolean, filters: GetContractorFilters, result: Contractor[]): void => {
  const cacheKey = getCacheKey(canUpdate, filters);

  try {
    cache.set(cacheKey, result);
  } catch {
    // cache is full
  }
};
