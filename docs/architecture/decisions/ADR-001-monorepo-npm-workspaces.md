# ADR-001: Monorepo with npm workspaces

**Date**: 2026-03-08
**Status**: Accepted

## Context
The project has three distinct code units: a backend API, a frontend SPA, and a shared types package. We need a strategy to manage them in one repository.

## Decision
Use a single git repository with npm native workspaces. No additional monorepo tooling (no Turborepo, Nx, Lerna).

## Rationale
- npm workspaces are built into npm ≥7 — zero additional dependencies
- The project has only 3 packages — build caching (Turborepo's main benefit) is irrelevant at this scale
- Simpler mental model for a university team
- `npm install` at root hoists all dependencies; `npm run <script> --workspaces` runs scripts across all packages

## Consequences
- No incremental build caching — acceptable for 3 packages
- No task dependency graph — CI runs jobs in parallel manually via GitHub Actions matrix
- If the project grows to 10+ packages, migrate to Turborepo
