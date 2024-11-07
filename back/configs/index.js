import dotenv from 'dotenv';
import path from 'path';

// Načítaj .env súbor
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Exportuj konfiguračné objekty
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || 'localhost',
  
  // Database
  DB_URL: process.env.DATABASE_URL,
  DB_POOL_MIN: parseInt(process.env.POSTGRES_POOL_MIN || '2', 10),
  DB_POOL_MAX: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
  
  // Redis
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // WebSocket
  WS_PATH: process.env.WS_PATH || '/ws',
  WS_HEARTBEAT: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
};

// Validácia required env premenných
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export { default as logger } from './logger.js';
export { default as redis } from './redis.js';
export { default as database } from './database.js';