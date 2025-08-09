import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach(k => {
      const entry = store[k];
      if (entry && entry.resetTime < now) {
        delete store[k];
      }
    });

    // Get or create rate limit entry
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Check if rate limit exceeded
    if (store[key].count >= max) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
      return;
    }

    // Increment counter
    store[key].count++;

    // Add headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - store[key].count);
    res.setHeader('X-RateLimit-Reset', store[key].resetTime);

    next();
  };
};

// Specific rate limits for different endpoints
export const authRateLimit = rateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes for auth
export const apiRateLimit = rateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes for general API 