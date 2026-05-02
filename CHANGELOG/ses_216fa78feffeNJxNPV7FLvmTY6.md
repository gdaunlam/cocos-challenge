---
session_id: ses_216fa78feffeNJxNPV7FLvmTY6
date: 2026-05-02T14:09:06.817Z
title: Listar sesiones de Open Code en directorio actual
---

## Summary
Explored OpenCode internals to understand how sessions are stored and accessed. Discovered that sessions are stored in SQLite at `~/.local/share/opencode/opencode.db`. Created two reusable skills for listing and reading session content.

## Key Changes
- Discovered session table schema with id, title, directory, time_updated columns
- Identified message and part tables for conversation content
- Created skill `list-sessions` at `~/.claude/skills/list-sessions/SKILL.md` for querying sessions by directory
- Created skill `get-session-content` at `~/.claude/skills/get-session-content/SKILL.md` for reading conversation content
- Sessions use bun:sqlite with ESM import syntax to query the database
