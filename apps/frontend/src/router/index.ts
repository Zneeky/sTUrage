import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'AppLayout' | 'AuthLayout';
    public?: boolean;
    adminOnly?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'AuthLayout', public: true },
    },
    { path: '/', redirect: '/dashboard' },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/products/:id',
      component: () => import('@/views/ProductDetailView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/categories',
      component: () => import('@/views/CategoriesView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/stock-movements',
      component: () => import('@/views/StockMovementsView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/reports',
      component: () => import('@/views/ReportsView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { layout: 'AppLayout' },
    },
    {
      path: '/users',
      component: () => import('@/views/UsersView.vue'),
      meta: { layout: 'AppLayout', adminOnly: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) return '/login';
  if (to.path === '/login' && auth.isAuthenticated) return '/dashboard';
  if (to.meta.adminOnly && auth.user?.role !== 'ADMIN') return '/dashboard';
});

export default router;
