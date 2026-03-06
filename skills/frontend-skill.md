# Frontend Skill — STURage

## Stack
Vue 3 (Composition API) + TypeScript + Vite + Pinia + Vue Router + Axios

## Conventions
- Views in `src/views/` — one per route
- Components in `src/components/` — reusable UI
- Stores in `src/stores/` — Pinia stores per domain
- API calls in `src/api/` — axios wrappers
- Use `<script setup lang="ts">` in all SFCs
- Use `defineProps`, `defineEmits`, `defineExpose` — no Options API

## State Management (Pinia)
- `auth.ts` — token, user, isAuthenticated
- `products.ts` — product list, current product (Sprint 2)
- Keep stores thin — business logic in composables

## API Integration
- Base Axios instance with JWT interceptor
- Handle 401 → redirect to /login
- Handle 429 → show toast "Too many requests"

## Routing
- Lazy-load all views: `() => import('@/views/XView.vue')`
- Guard protected routes with navigation guard checking auth store
