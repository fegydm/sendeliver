// ./back/config/redis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

export const initRedis = async () => {
  await client.connect();
};

export const getCache = async (key) => {
  return await client.get(key);
};

export const setCache = async (key, value, expiry = 3600) => {
  await client.set(key, value, { EX: expiry });
};
