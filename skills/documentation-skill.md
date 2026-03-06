# Documentation Skill — STURage

## Structure
```
docs/
  architecture/  — stack.md, diagrams
  api/           — contract.md, postman-collection.json
  database/      — schema.md
  ux/            — wireframes.md
  security/      — rate-limiting.md, ...
  devops/        — ci.md, docker.md
  qa/            — test-plan.md
  project-management/ — sprint notes
```

## Standards
- Every doc starts with: `# Title\n> Issue key | Sprint X`
- Tables for structured data (entities, endpoints, status codes)
- Code blocks for all commands and JSON examples
- Keep docs in sync with code — update on every PR that changes behavior

## API Contract Rules
- Document every endpoint: method, path, auth required, request body, response shape, error codes
- Postman collection mirrors the contract
- Status codes table at bottom of contract.md

## Architecture Doc Rules
- Update stack.md if any technology decision changes
- Always document WHY (rationale) not just WHAT
