# ADR-003: Vue 3 for Frontend

**Date**: 2026-03-08
**Status**: Accepted

## Context
We need a frontend SPA framework. The team evaluated React and Vue 3.

## Decision
Vue 3 with Composition API, Vite, Pinia (state), Vue Router.

## Rationale
- Team preference and prior familiarity with Vue
- Composition API (`<script setup>`) provides similar ergonomics to React hooks
- Pinia is the official Vue state manager — simpler API than Vuex, excellent TypeScript support
- Vite provides the fastest dev server HMR and smallest production bundles
- Vue SFCs (`.vue` files) co-locate template, script, and style — easy to read
- React rejected: larger ecosystem but no team advantage at this scale

## Consequences
- Frontend agents must use `<script setup lang="ts">` — no Options API
- State goes in Pinia stores under `src/stores/`
- Routes are lazy-loaded: `() => import('@/views/XView.vue')`
- API calls go through a centralised Axios instance (to be created in Sprint 2)
