import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<{ id: string; email: string; role: string } | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isAuthenticated, setToken, logout };
});
