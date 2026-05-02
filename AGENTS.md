# Nest Alive - OpenCode Agent Rules

## CRITICAL: Read CHANGELOG Before Starting Work

**You MUST read the CHANGELOG directory before taking ANY action.** This is not optional.

```bash
ls -la CHANGELOG/ && for f in CHANGELOG/*.md; do echo "=== $(basename $f) ===" && head -10 "$f"; done
```

**Why this is MANDATORY:**
- Avoid contradicting previous decisions that are already implemented
- Build on existing work instead of duplicating or conflicting
- Understand architectural decisions and evolution of the project
- Prevent re-implementing something that already exists

**When you MUST read the changelog:**
1. At the START of EVERY session before you do anything else
2. When the user asks to work on something related to existing modules
3. When you need to understand how something was previously implemented
4. Before creating new files or modifying existing ones

---

## Changelog Updates (MANDATORY after changes)

After completing ANY work that modifies files, creates new functionality, or changes behavior:

### If a changelog entry already exists for this session:

Update the existing file at `CHANGELOG/{session_id}.md` by:
1. Adding new changes to the "Key Changes" table
2. Updating the "Summary" if the scope changed significantly
3. Adding a "Last Updated" timestamp

### If NO changelog entry exists for this session:

Create a new file at `CHANGELOG/{session_id}.md` with:

```markdown
---
session_id: {session_id_from_context}
date: {current_timestamp_ISO}
title: {brief_descriptive_title}
---

## Summary
{Brief description of what was accomplished, 1-3 sentences, context-independent}

## Key Changes
| File | Change |
|------|--------|
| path/to/file | Description of change |
| ... | ...

## Related
{Any related sessions or future work}
```

### Session ID Location
Find your session ID in the tool invocation context or ask the user.

---

## Changelog Format Guidelines

- **Be concise**: Entries should be under 2KB
- **Context-independent**: Someone reading should understand what changed without being in the session
- **File-specific**: Reference actual file paths, not generic descriptions
- **Action-oriented**: Describe what was DONE, not what was discussed

---

## Example Entry

```markdown
---
session_id: ses_216fa78feffeNJxNPV7FLvmTY6
date: 2026-05-02T14:09:06.817Z
title: Implement user authentication
---

## Summary
Added JWT-based authentication with login/logout endpoints.

## Key Changes
| File | Change |
|------|--------|
| src/auth/jwt.service.ts | Created JWT generation and validation |
| src/auth/login.dto.ts | Created login request DTO |
| src/auth.controller.ts | Added POST /login and POST /logout |
| src/main.ts | Configured AuthModule |

## Related
Follow-up session needed for refresh tokens
```

---

## Additional Rules

- Commit AGENTS.md to Git so all team members share the same rules
- Keep changelog entries stable - they're reference documents, not logs
- If a session is purely exploratory/research with no file changes, a changelog entry is not required

---

## Pre-Implementation Changelog Check (MANDATORY)

Before implementing ANY change, you MUST check for potential conflicts with existing CHANGELOG entries:

### Procedure
1. **List changelog files** (most recent first):
   ```bash
   ls -la CHANGELOG/ && for f in CHANGELOG/*.md; do echo "=== $(basename $f) ===" && head -20 "$f"; done
   ```

2. **Read changelogs in reverse chronological order** (newest first) to understand the current state of the project

3. **Verify your intended change does not conflict with documented behavior**:
   - If your change would contradict something already implemented (per CHANGELOG), STOP and report the conflict
   - If your change would invalidate an existing implementation, STOP and report the conflict
   - Proceed only if your change is complementary or genuinely corrective

4. **Report before proceeding** if conflicts are found. Include:
   - What the CHANGELOG says
   - What your change would do
   - Request guidance on how to proceed