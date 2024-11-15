// ./back/services/cache.service.ts
import { getCache, setCache } from "../../configs/redis";

export const cacheData = async (key: string, data: any): Promise<void> => {
  await setCache(key, JSON.stringify(data));
};

export const getCachedData = async (key: string): Promise<any | null> => {
  const data = await getCache(key);
  return data ? JSON.parse(data) : null;
};
