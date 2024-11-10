// ./back/services/cacheService.js
import { getCache, setCache } from '../config/redis.js';

export const cacheData = async (key, data) => {
  await setCache(key, JSON.stringify(data));
};

export const getCachedData = async (key) => {
  const data = await getCache(key);
  return data ? JSON.parse(data) : null;
};
