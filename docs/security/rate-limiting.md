# Security: Rate Limiting — STURage

> STUR-68 | Sprint 1

## Implementation

Library: `express-rate-limit` v7

File: `apps/backend/src/middleware/rateLimiter.ts`

Applied in: `apps/backend/src/app.ts`

## Limiters

### apiLimiter
- Applied to: **all `/api/*` routes** (globally)
- Window: 15 minutes (configurable)
- Max requests: 100 per window (configurable)
- Counts all requests regardless of success/failure

### authLimiter
- Applied to: **`/api/auth/login`** and **`/api/auth/register`** only
- Window: 15 minutes
- Max requests: 10 per window
- `skipSuccessfulRequests: true` — only failed attempts count toward the limit

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Window size in milliseconds (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window for apiLimiter |
| `RATE_LIMIT_AUTH_MAX` | `10` | Max failed auth attempts per window |

## Response Headers (RFC 6585 standard)

| Header | Description |
|---|---|
| `RateLimit-Limit` | Maximum requests allowed in this window |
| `RateLimit-Remaining` | Remaining requests in current window |
| `RateLimit-Reset` | Seconds until window resets |

## 429 Response Body

```json
{
  "status": 429,
  "error": "Too many requests, please try again later."
}
```

Auth-specific 429:
```json
{
  "status": 429,
  "error": "Too many authentication attempts, please try again in 15 minutes."
}
```

## Design Decisions

1. **In-memory store** — sufficient for single-instance deployment at university scale. For multi-instance production, replace with Redis store (`rate-limit-redis`).

2. **Standard headers** — `RateLimit-*` (RFC 6585) preferred over legacy `X-RateLimit-*`. Frontend can read `RateLimit-Remaining` to show warnings before hitting the limit.

3. **`skipSuccessfulRequests: true` on authLimiter** — legitimate users logging in repeatedly don't get blocked; only failed attempts count.

4. **Trust proxy** — if deployed behind a reverse proxy (nginx, Cloudflare), set `app.set('trust proxy', 1)` in Express so the real client IP is used rather than the proxy IP.

## Frontend Integration

The Vue frontend should:
- On 429 response: display toast "Too many requests — please wait a moment"
- On auth 429 response: display "Too many failed attempts — try again in 15 minutes"
- Optionally read `RateLimit-Remaining` header and warn proactively
