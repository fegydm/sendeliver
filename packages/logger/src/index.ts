// File: ./packages/logger/src/index.ts
// Shared logger implementation for both backend and frontend

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Helper to safely access environment variables
const getEnvVariable = (key: string, fallback: string): string => {
  // Try Node.js environment (backend)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  // Try globalThis for frontend (Vite injects env vars into globalThis)
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }
  return fallback;
};

// Determine current environment and log level
const currentEnvironment = getEnvVariable('NODE_ENV', 'development');
const defaultLevel = currentEnvironment === 'production' ? 'info' : 'debug';
const logLevelEnv = getEnvVariable('LOG_LEVEL', defaultLevel);

// Convert string level to enum value
const getLogLevelValue = (level: string): LogLevel => {
  switch (level.toLowerCase()) {
    case 'error':
      return LogLevel.ERROR;
    case 'warn':
      return LogLevel.WARN;
    case 'info':
      return LogLevel.INFO;
    case 'debug':
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO;
  }
};

// Current numeric log level
const currentLogLevel = getLogLevelValue(logLevelEnv);

// Timestamp helper
const getTimestamp = (): string => new Date().toISOString();

// Logger methods
export const logger = {
  error: (message: string, ...meta: any[]): void => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...meta);
    }
  },

  warn: (message: string, ...meta: any[]): void => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(`[${getTimestamp()}] [WARN] ${message}`, ...meta);
    }
  },

  info: (message: string, ...meta: any[]): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(`[${getTimestamp()}] [INFO] ${message}`, ...meta);
    }
  },

  debug: (message: string, ...meta: any[]): void => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, ...meta);
    }
  },

  log: (level: LogLevel, message: string, ...meta: any[]): void => {
    if (level <= currentLogLevel) {
      const levelName = LogLevel[level];
      console.log(`[${getTimestamp()}] [${levelName}] ${message}`, ...meta);
    }
  },
};

export default logger;