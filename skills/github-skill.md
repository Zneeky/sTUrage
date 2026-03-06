# GitHub Skill — STURage

## Branch Naming
`feature/STUR-XX-short-description`
`fix/STUR-XX-short-description`
`chore/STUR-XX-short-description`

## Commit Format
`STUR-XX short imperative message`
Example: `STUR-5 initialize monorepo structure`

## PR Title Format
`STUR-XX Original Jira Issue Title`

## PR Body Template
```
## Summary
- What was implemented
- Key decisions made

## Jira
STUR-XX

## Checklist
- [ ] Tests pass
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Documentation updated
```

## Branch Strategy
- `main` — production-ready, protected
- `develop` — integration branch
- Feature branches off `develop`, PR back to `develop`
- `develop` → `main` for releases
