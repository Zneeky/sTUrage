# GitHub Skill — STURage

## Branch Naming
`feature/STUR-XX-short-description`
`fix/STUR-XX-short-description`
`chore/STUR-XX-short-description`

## Commit Format
`STUR-XX short imperative message`
Example: `STUR-5 initialize monorepo structure`

## Commit Date — MANDATORY
**Before making any commit, always ask the user:**
> "What date should I use for this commit (GIT_AUTHOR_DATE / GIT_COMMITTER_DATE)?"

Never use the current system date. Use the date provided by the user in the format:
`GIT_AUTHOR_DATE="YYYY-MM-DDTHH:MM:SS+0200" GIT_COMMITTER_DATE="YYYY-MM-DDTHH:MM:SS+0200" git commit -m "..."`

This applies to every commit: feature work, bug fixes, rebases, and amends.

## Authorship — MANDATORY
- The only allowed author/committer is `arkan <arkanahmedov02@gmail.com>`
- Never add Co-authored-by lines of any kind
- Never reference Claude, Anthropic, or any AI tool in commit messages, PR bodies, or code comments

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
