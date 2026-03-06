import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', component: () => import('@/views/RegisterView.vue') },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/products', component: () => import('@/views/ProductsView.vue') },
    { path: '/products/:id', component: () => import('@/views/ProductDetailView.vue') },
    { path: '/categories', component: () => import('@/views/CategoriesView.vue') },
    { path: '/stock-movements', component: () => import('@/views/StockMovementsView.vue') },
    { path: '/reports', component: () => import('@/views/ReportsView.vue') },
  ],
});

export default router;
