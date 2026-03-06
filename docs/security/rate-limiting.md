# Security: Rate Limiting — STURage

> STUR-68 | Sprint 1

## Implementation

Using `express-rate-limit` v7 applied as middleware in [apps/backend/src/middleware/rateLimiter.ts](../../apps/backend/src/middleware/rateLimiter.ts).

## Configuration

| Limiter    | Window     | Max Requests | Applied To             |
|------------|------------|--------------|------------------------|
| apiLimiter | 15 minutes | 100          | All `/api/*` routes    |
| authLimiter| 15 minutes | 10           | `/api/auth/login`, `/api/auth/register` |

Both values are configurable via environment variables:

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS=100    # max per window
```

## Response Headers

- `RateLimit-Limit` — maximum requests allowed
- `RateLimit-Remaining` — remaining in current window
- `RateLimit-Reset` — seconds until window resets

## 429 Response Body

```json
{
  "status": 429,
  "error": "Too many requests, please try again later."
}
```

## Decision Rationale

- Express-rate-limit is the de facto standard for Express.js projects
- In-memory store is sufficient for university project scope (no Redis needed)
- Separate stricter limiter on auth endpoints to prevent brute force
- Standard headers (`RateLimit-*`) preferred over legacy `X-RateLimit-*`
