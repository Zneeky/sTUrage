import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';

vi.mock('../../api/auth.api', () => ({
  login: vi.fn().mockResolvedValue({
    token: 'mock-token',
    user: { id: 'u1', email: 'admin@sturage.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User' },
  }),
  me: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}));

const mockUser = { id: 'u1', email: 'admin@sturage.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User' };

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('isAuthenticated is false when no token is set', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
  });

  it('isAuthenticated becomes true after setToken', () => {
    const store = useAuthStore();
    store.setToken('some-token');
    expect(store.isAuthenticated).toBe(true);
  });

  it('setUser persists user to localStorage', () => {
    const store = useAuthStore();
    store.setUser(mockUser);
    expect(JSON.parse(localStorage.getItem('user')!)).toMatchObject(mockUser);
  });

  it('logout clears token, user, and localStorage', () => {
    const store = useAuthStore();
    store.setToken('tok');
    store.setUser(mockUser);
    store.logout();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('login calls the API and sets token + user', async () => {
    const store = useAuthStore();
    await store.login('admin@sturage.com', 'password');
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('mock-token');
    expect(store.user).toMatchObject({ email: 'admin@sturage.com' });
  });
});
