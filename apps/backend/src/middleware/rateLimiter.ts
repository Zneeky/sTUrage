import rateLimit from 'express-rate-limit';

// Global limiter — applied to all /api/* routes in app.ts
// Configurable via environment variables so values can be tuned per environment.
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,  // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
  // keyGenerator uses req.ip by default — behind a proxy set trust proxy in Express
});

// Stricter limiter for authentication endpoints — brute-force protection.
// Default: 30 failed attempts per 10 minutes per IP.
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '600000', 10),
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '30', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login attempts — try again in a few minutes.',
  },
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});
