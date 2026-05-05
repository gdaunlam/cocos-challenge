# Nest Alive - OpenCode Agent Rules

## CRITICAL: Read CHANGELOG Before Starting Work

**You MUST read the CHANGELOG directory before taking ANY action.** This is not optional.

```bash
ls -la docs/CHANGELOG/ && for f in docs/CHANGELOG/*.md; do echo "=== $(basename $f) ===" && head -10 "$f"; done
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

Update the existing file at `docs/CHANGELOG/{session_id}.md` by:
1. Adding new changes to the "Key Changes" table
2. Updating the "Summary" if the scope changed significantly
3. Adding a "Last Updated" timestamp

### If NO changelog entry exists for this session:

Create a new file at `docs/CHANGELOG/{session_id}.md` with:

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
   ls -la docs/CHANGELOG/ && for f in docs/CHANGELOG/*.md; do echo "=== $(basename $f) ===" && head -20 "$f"; done
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

---

## Code Standards (MANDATORY)

**You MUST follow the standards defined in `docs/STANDARDS.md`.** Read it before starting any implementation.

```bash
cat docs/STANDARDS.md
```

### Quick Reference

| Rule | Standard |
|------|----------|
| Module structure | `src/domain/{entity}/{entity}.module.ts` |
| Controller | `src/domain/{entity}/controller/` |
| Business interfaces | `src/domain/{entity}/controller/{entity}.interface.ts` |
| Repository | `src/domain/{entity}/repository/` |
| Service | `src/domain/{entity}/service/` |
| Middleware registration | Always in `app.module.ts`, NOT in child modules |
| `next()` in middleware | Must be inside `runWithTraceId()` callback |
| Swagger docs | Use `@ApiProperty()` on DTOs and entities |

### Why Standards Matter

- **Consistency**: Any developer can navigate the codebase without learning project-specific patterns
- **Discoverability**: When something is where you expect it to be
- **Testability**: Patterns like "middleware in app.module.ts" are easier to test because there's no hidden configuration
- **No magic**: Configuration that happens in multiple places is configuration that gets forgotten

### When Standards Don't Apply

If a situation isn't covered by STANDARDS.md:
1. Use your best judgment following NestJS conventions
2. Document your decision
3. Propose a new standard in STANDARDS.md if it's a recurring pattern

---

## Pre-Commit Checklist

Before committing, verify:
- [ ] Changes follow STANDARDS.md rules
- [ ] CHANGELOG updated (if applicable)
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` passes

---

## CRITICAL: Read SOLUTION.md Before Starting Work

**You MUST read `docs/SOLUTION/SOLUTION.md` before taking ANY action.**

```bash
cat docs/SOLUTION/SOLUTION.md
```

**Why this is MANDATORY:**
- Avoid contradicting design decisions already made in discussions
- Build on existing solutions instead of re-solving problems
- Understand the accepted patterns and approaches
- Reference the established design for Portfolio, Cash, and Position calculations

### Quick Reference from SOLUTION.md

**Portfolio Calculations:**
```
quantity = Σ (size * side_multiplier) where BUY=+1, SELL=-1
costBasis = Σ (size * price) for BUY FILLED orders only
totalReturnPercentage = (marketValue - costBasis) / costBasis * 100
```

**Cash Calculations (FILLED orders only):**
- CASH_IN: += size
- CASH_OUT: -= size
- BUY: -= size * price
- SELL: += size * price

**Reserved = NEW LIMIT BUY orders:**
```
reserved = Σ (size * price) for NEW + LIMIT + BUY
```

**Design Patterns:**
Use **CashCalculator + PositionCalculator + PortfolioService** pattern.

Entities go in `src/domain/shared/entities/`:
- `order.entity.ts`
- `instrument.entity.ts`
- `marketdata.entity.ts`
- `user.entity.ts`
- `portfolio.entity.ts`

### Update SOLUTION.md After Work

After completing ANY significant work, update `docs/SOLUTION/SOLUTION.md`:
1. Add a new section describing the problem and solution
2. Include code snippets if relevant
3. Document design decisions and patterns used
4. Keep it concise and reference actual file paths