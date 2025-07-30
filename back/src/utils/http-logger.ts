// File: back/src/utils/http-logger.ts  
// Last change: Simple request logger at start

export function httpLogger(req: any, res: any, next: any) {
  const isBoten = req.useragent?.isBoten ? "🤖" : "👤";
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  
  console.log(`${ip} ${req.method} ${req.url} ${isBoten}`);
  
  next();
}