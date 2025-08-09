import { Request, Response, NextFunction } from 'express';
import type { CorsOptions } from 'cors';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

// Build allowed origins list from env (comma-separated) with sensible defaults
const allowedOriginsFromEnv = (process.env.CORS_ORIGIN || 'https://talent-ddkafcl6b-yousifs-projects-6b79b898.vercel.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Optional: allow all *.vercel.app previews by default (can be disabled by setting explicit CORS_ORIGIN)
const defaultVercelPreviewRegex = /\.vercel\.app$/i;

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients with no Origin header
    if (!origin) return callback(null, true);

    // If any exact match
    const exactAllowed = allowedOriginsFromEnv.includes(origin);
    // If a regex string was provided in env, support it (e.g. "/\\.vercel\\.app$/i")
    const regexAllowed = allowedOriginsFromEnv.some((entry) => {
      if (entry.startsWith('/') && entry.endsWith('/i')) {
        try {
          const pattern = entry.slice(1, -2);
          const re = new RegExp(pattern, 'i');
          return re.test(origin);
        } catch {
          return false;
        }
      }
      if (entry.startsWith('/') && entry.endsWith('/')) {
        try {
          const pattern = entry.slice(1, -1);
          const re = new RegExp(pattern);
          return re.test(origin);
        } catch {
          return false;
        }
      }
      return false;
    });

    const vercelPreviewAllowed = defaultVercelPreviewRegex.test(origin);

    if (exactAllowed || regexAllowed || vercelPreviewAllowed) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Referer'
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};