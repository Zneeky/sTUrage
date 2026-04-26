import axios from 'axios';
import { Notify } from 'quasar';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const { useAuthStore } = await import('@/stores/auth');
      const { default: router } = await import('@/router');
      useAuthStore().logout();
      router.push('/login');
    } else if (error.response?.status === 429) {
      Notify.create({ type: 'warning', message: 'Too many requests — try again shortly' });
    }
    return Promise.reject(error);
  }
);

export default client;
