import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// TC-022: Rate limiter returns 429 when request quota is exceeded.
// Uses isolated express apps per test to avoid shared counter state.

function makeLimitedApp(max: number) {
  const testApp = express();
  const limiter = rateLimit({
    windowMs: 60_000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, error: 'Too many requests - slow down.' },
  });
  testApp.use(express.json());
  testApp.post('/limited', limiter, (_req, res) => res.json({ ok: true }));
  return testApp;
}

describe('TC-022: Rate limiter middleware', () => {
  it('allows requests within the configured limit', async () => {
    const app = makeLimitedApp(5);
    const res1 = await request(app).post('/limited');
    const res2 = await request(app).post('/limited');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  it('returns 429 with error message after limit is exceeded', async () => {
    const app = makeLimitedApp(2);
    await request(app).post('/limited'); // 1
    await request(app).post('/limited'); // 2 - at limit
    const res = await request(app).post('/limited'); // 3 - over limit

    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
    expect(res.body.status).toBe(429);
  });

  it('includes standard RateLimit-* headers in responses', async () => {
    const app = makeLimitedApp(10);
    const res = await request(app).post('/limited');

    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('decrements remaining count with each request', async () => {
    const app = makeLimitedApp(10);
    const res1 = await request(app).post('/limited');
    const res2 = await request(app).post('/limited');

    const remaining1 = parseInt(res1.headers['ratelimit-remaining'] as string, 10);
    const remaining2 = parseInt(res2.headers['ratelimit-remaining'] as string, 10);

    expect(remaining2).toBe(remaining1 - 1);
  });
});
