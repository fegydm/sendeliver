// File: ./back/src/utils/rate-limiter.ts
// Last change: Implementation of basic token bucket rate limiter

export class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly refillRate: number;
    private readonly interval: number;
  
    constructor(refillRate: number, interval: number) {
      this.tokens = refillRate;
      this.lastRefill = Date.now();
      this.refillRate = refillRate;
      this.interval = interval;
    }
  
    private refill(): void {
      const now = Date.now();
      const timePassed = now - this.lastRefill;
      const newTokens = Math.floor(timePassed / this.interval) * this.refillRate;
      
      if (newTokens > 0) {
        this.tokens = Math.min(this.refillRate, this.tokens + newTokens);
        this.lastRefill = now;
      }
    }
  
    public async acquire(): Promise<void> {
      this.refill();
  
      if (this.tokens > 0) {
        this.tokens--;
        return;
      }
  
      // Waiting for next interval
      const waitTime = this.interval - (Date.now() - this.lastRefill);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
  }