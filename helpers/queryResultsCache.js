"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheResult = exports.getCachedResult = exports.clearCache = void 0;
const NodeCache = require("node-cache");
const cache = new NodeCache({
    stdTTL: 60 * 60,
    useClones: false,
    maxKeys: 50
});
const getCacheKey = (canUpdate, filters) => {
    return canUpdate.toString() + ":" + JSON.stringify(filters);
};
const clearCache = () => {
    cache.flushAll();
};
exports.clearCache = clearCache;
const getCachedResult = (canUpdate, filters) => {
    const cacheKey = getCacheKey(canUpdate, filters);
    const result = cache.get(cacheKey);
    if (!result) {
        return false;
    }
    return result;
};
exports.getCachedResult = getCachedResult;
const cacheResult = (canUpdate, filters, result) => {
    const cacheKey = getCacheKey(canUpdate, filters);
    try {
        cache.set(cacheKey, result);
    }
    catch (_e) {
    }
};
exports.cacheResult = cacheResult;
