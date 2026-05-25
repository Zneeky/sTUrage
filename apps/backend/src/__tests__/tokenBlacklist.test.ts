/// <reference types="jest" />
import { blacklistToken, isBlacklisted } from '../utils/tokenBlacklist';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('tokenBlacklist', () => {
  it('returns false for a token that was never blacklisted', () => {
    expect(isBlacklisted('unknown-token')).toBe(false);
  });

  it('returns true immediately after blacklisting a token', () => {
    blacklistToken('active-token', 60_000);
    expect(isBlacklisted('active-token')).toBe(true);
  });

  it('removes the token automatically after the TTL expires', () => {
    blacklistToken('short-lived', 100);
    expect(isBlacklisted('short-lived')).toBe(true);
    jest.advanceTimersByTime(200);
    expect(isBlacklisted('short-lived')).toBe(false);
  });
});
