# Decision Log — STURage

## DL-001: Vue.js over React for Frontend
**Date**: 2026-04-25
**Decision**: Use Vue 3 (Composition API) + Pinia + Vue Router
**Reason**: Team preference confirmed by project lead mid-Sprint 1
**Trade-off**: Slightly smaller ecosystem than React; however, Vue 3 is more approachable for university teams new to frontend frameworks
**Impact**: Replaced React scaffold; frontend package.json, vite.config.ts, App.vue, router, stores updated

## DL-002: npm workspaces over Turborepo/Nx
**Date**: 2026-04-25
**Decision**: Use native npm workspaces
**Reason**: Zero additional tooling overhead; sufficient for 3-package monorepo
**Trade-off**: No build caching or dependency graph optimization
**Impact**: package.json at root with `workspaces` field

## DL-003: In-memory rate limiting (no Redis)
**Date**: 2026-04-25
**Decision**: Use express-rate-limit with default memory store
**Reason**: University project; single-instance deployment; Redis adds infrastructure complexity
**Trade-off**: Resets on server restart; not suitable for multi-instance production deployment
**Impact**: Acceptable for project scope; documented for future upgrade path

## DL-004: CUID over UUID for primary keys
**Date**: 2026-04-25
**Decision**: Use Prisma `cuid()` default
**Reason**: URL-safe, sortable, no UUID library needed, Prisma native support
**Trade-off**: Longer than auto-increment integers
**Impact**: All entity IDs are CUID strings

## DL-005: Jira MCP not available during Sprint 1
**Date**: 2026-04-25
**Decision**: Proceed based on detailed task descriptions in prompt; document all assumptions
**Reason**: `https://mcp.atlassian.com/v1/mcp` requires OAuth authentication not available in this session
**Impact**: MCP added to user settings for future sessions; Sprint 1 implementation based on prompt requirements
