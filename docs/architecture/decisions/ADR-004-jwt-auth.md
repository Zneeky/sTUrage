# ADR-004: JWT Stateless Authentication

**Date**: 2026-03-08
**Status**: Accepted

## Context
We need an authentication mechanism for the API. Options: session cookies (server-side state), JWT (stateless), or OAuth (third-party).

## Decision
JWT Bearer tokens stored in localStorage on the client.

## Rationale
- Stateless — no session store needed; each request is self-contained
- Simple to implement with `jsonwebtoken` library
- Works well with a single-instance Express server at university scale
- Role claim embedded in token — no extra DB lookup per request

## Trade-offs accepted
- Tokens cannot be individually revoked before expiry (acceptable for university project)
- localStorage is vulnerable to XSS — mitigated by keeping JWT_SECRET strong and planning httpOnly cookie migration in Sprint 3
- For production: use short-lived access tokens (15 min) + refresh tokens stored in httpOnly cookies

## Configuration
- `JWT_SECRET` env var — must be set in production
- `JWT_EXPIRES_IN` env var — default `7d`
- Token payload: `{ id, email, role }`
