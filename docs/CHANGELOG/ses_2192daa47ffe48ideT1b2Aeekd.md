# ses_2192daa47ffe48ideT1b2Aeekd

**Date:** 2026-05-01T20:53:57.432Z

**Title:** tsbuildinfo: ¿se puede borrar?

## Summary
User asked about the `tsconfig.tsbuildinfo` file - whether it's generated on every build and if it can be deleted. Then requested to delete it AND disable its generation in the future.

## Changes Made
- Deleted existing `tsconfig.tsbuildinfo` file
- Disabled TypeScript incremental compilation in `tsconfig.json` to prevent future generation

## Key Changes
| File | Change |
|------|--------|
| `tsconfig.json` | Changed `"incremental": true` to `"incremental": false` |
| `tsconfig.tsbuildinfo` | Deleted |