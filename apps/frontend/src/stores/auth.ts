import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, me as apiMe, logout as apiLogout } from '@/api/auth.api';
import type { AuthUser } from '@/api/auth.api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  function setUser(u: AuthUser) {
    user.value = u;
    localStorage.setItem('user', JSON.stringify(u));
  }

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data.user);
  }

  async function fetchMe() {
    const data = await apiMe();
    setUser(data);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function logoutApi() {
    try { await apiLogout(); } catch { /* ignore */ }
    logout();
  }

  return { token, user, isAuthenticated, setToken, setUser, login, fetchMe, logout, logoutApi };
});
