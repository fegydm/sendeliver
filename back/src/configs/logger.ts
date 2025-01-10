// File: back/configs/logger.ts
// Last change: Simplified logging system using console-based methods

// Basic logger with different logging levels using console methods
export const logger = {
  info: (message: string) => console.log(`[INFO]: ${message}`),
  warn: (message: string) => console.warn(`[WARN]: ${message}`),
  error: (message: string, error?: any) => 
      console.error(`[ERROR]: ${message}`, error ? error : ''),
  debug: (message: string) => console.debug(`[DEBUG]: ${message}`)
};
