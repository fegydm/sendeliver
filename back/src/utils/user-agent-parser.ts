// File: back/src/utils/user-agent-parser.ts
// Last change: Replace express-useragent with simple bot detection

export function isBot(userAgent?: string): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /googlebot/i, /bingbot/i, /facebookexternalhit/i,
    /twitterbot/i, /linkedinbot/i, /whatsapp/i,
    /telegram/i, /slack/i, /discord/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

export function userAgentMiddleware(req: any, res: any, next: any) {
  req.useragent = {
    isBoten: isBot(req.headers['user-agent'])
  };
  next();
}