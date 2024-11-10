// ./back/configs/redis.ts
import { createClient, RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL
});

export const initRedis = async (): Promise<void> => {
  await client.connect();
};

export const getCache = async (key: string): Promise<string | null> => {
  return await client.get(key);
};

export const setCache = async (key: string, value: string, expiry = 3600): Promise<void> => {
  await client.set(key, value, { EX: expiry });
};