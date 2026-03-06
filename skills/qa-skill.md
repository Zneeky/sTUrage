# QA Skill — STURage

## Backend Testing
- Framework: Jest + ts-jest + supertest
- Config: `apps/backend/jest.config.ts`
- Test files: `src/**/*.test.ts`
- Coverage: `npm run test:coverage`

## Frontend Testing
- Framework: Vitest + @vue/test-utils
- Test files: `src/**/*.test.ts`

## Test Priorities
1. Health check endpoint
2. Auth: register, login, invalid credentials, rate limit
3. Products CRUD: happy path + validation errors
4. Stock movement: creates movement + updates StockItem quantity
5. Role-based access: 403 for unauthorized roles

## Acceptance Criteria Checklist per Issue
Before marking a Jira issue Done:
- [ ] All acceptance criteria from Jira verified
- [ ] Unit/integration tests written and passing
- [ ] Lint passes
- [ ] Build passes
- [ ] No regressions in other features
