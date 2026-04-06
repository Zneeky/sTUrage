const blacklist = new Set<string>();

export function blacklistToken(token: string, expiresInMs: number): void {
  blacklist.add(token);
  setTimeout(() => blacklist.delete(token), expiresInMs);
}

export function isBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
