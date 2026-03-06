# Jira Skill — STURage

## Connection
MCP: atlassian (https://mcp.atlassian.com/v1/mcp)
Project: STUR
Board: https://expbanking.atlassian.net/jira/software/projects/STUR/boards/169/backlog

## Workflow

1. Before starting any work, fetch the Jira issue: `mcp_atlassian_jira_get_issue STUR-XX`
2. Read: summary, description, acceptance criteria, comments, attachments
3. Map work to branch: `feature/STUR-XX-short-title`
4. Every commit must start with: `STUR-XX message`
5. PR title must start with: `STUR-XX Original Jira Title`
6. After implementation, post a comment to the issue with implementation summary
7. Transition issue status: In Progress → In Review → Done

## Issue Fields to Check
- Summary (title)
- Description (requirements)
- Acceptance Criteria (custom field or in description)
- Comments (clarifications, decisions)
- Attachments (designs, specs)
- Labels / Story Points
- Linked issues (dependencies)
