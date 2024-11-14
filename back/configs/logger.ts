// ./back/configs/logger.ts
import winston from "winston";

const { combine, timestamp, printf, errors } = winston.format;

const logFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info", // Môžete nastaviť úroveň logovania podľa potreby (info, warn, error, atď.)
  format: combine(
    timestamp(),
    errors({ stack: true }), // Toto bude logovať aj stack trace, ak je k dispozícii
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        timestamp(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export { logger };
