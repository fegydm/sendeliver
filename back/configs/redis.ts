// ./back/configs/redis.ts
import { createClient, RedisClientType } from "redis";

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", // pridanie fallback hodnoty pre REDIS_URL
});

export const initRedis = async (): Promise<void> => {
  try {
    await client.connect();
    console.log("Redis client connected");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Error getting key ${key} from Redis:`, error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  expiry = 3600
): Promise<void> => {
  try {
    await client.set(key, value, { EX: expiry });
  } catch (error) {
    console.error(`Error setting key ${key} in Redis:`, error);
  }
};
