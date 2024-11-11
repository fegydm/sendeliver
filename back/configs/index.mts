// ./back/configs/index.ts
import dotenv from "dotenv";
import path from "path";
import * as redis from "./redis.mjs";

// Načítaj .env súbor
dotenv.config({ path: path.join(process.cwd(), ".env") });

// Exportuj konfiguračné objekty
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  HOST: process.env.HOST || "localhost",

  // Database
  DB_URL: process.env.DATABASE_URL,
  DB_POOL_MIN: parseInt(process.env.POSTGRES_POOL_MIN || "2", 10),
  DB_POOL_MAX: parseInt(process.env.POSTGRES_POOL_MAX || "10", 10),

  // Redis
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // Security
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || "24h",
  COOKIE_SECRET: process.env.COOKIE_SECRET,

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],

  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

  // WebSocket
  WS_PATH: process.env.WS_PATH || "/ws",
  WS_HEARTBEAT: parseInt(process.env.WS_HEARTBEAT_INTERVAL || "30000", 10),

  // OpenAI Configuration
  openai: {
    API_KEY: process.env.OPENAI_API_KEY,
    MODEL: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
    MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || "500", 10),
    SYSTEM_PROMPT:
      process.env.OPENAI_SYSTEM_PROMPT ||
      `You are a logistics AI assistant. Your task is to:
      1. Extract shipping details from user messages
      2. Identify: pickup location, delivery location, weight, number of pallets, and times
      3. Return data in a structured format
      4. Respond in the same language as the user's message
      Keep responses focused on transportation logistics.`,
  },
};

// Validácia required env premenných
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL", "OPENAI_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export { redis };
