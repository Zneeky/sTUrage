import rateLimit from 'express-rate-limit';

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
