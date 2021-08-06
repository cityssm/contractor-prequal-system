import NodeCache from "node-cache";
const cache = new NodeCache({
    stdTTL: 60 * 60,
    useClones: false,
    maxKeys: 50
});
const getCacheKey = (canUpdate, filters) => {
    return canUpdate.toString() + ":" + JSON.stringify(filters);
};
export const clearCache = () => {
    cache.flushAll();
};
export const getCachedResult = (canUpdate, filters) => {
    const cacheKey = getCacheKey(canUpdate, filters);
    const result = cache.get(cacheKey);
    if (!result) {
        return false;
    }
    return result;
};
export const cacheResult = (canUpdate, filters, result) => {
    const cacheKey = getCacheKey(canUpdate, filters);
    try {
        cache.set(cacheKey, result);
    }
    catch (_a) {
    }
};
