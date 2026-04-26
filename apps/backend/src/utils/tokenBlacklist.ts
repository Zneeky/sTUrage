// STUR-61: in-memory blacklist is acceptable for MVP — tokens expire naturally via JWT.
// Known limitation: the set is cleared on server restart, so a blacklisted token could
// be reused within its remaining TTL after a restart. Replace with Redis for production.
const blacklist = new Set<string>();

export function blacklistToken(token: string, expiresInMs: number): void {
  blacklist.add(token);
  setTimeout(() => blacklist.delete(token), expiresInMs);
}

export function isBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
