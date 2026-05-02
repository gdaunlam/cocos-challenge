---
session_id: ses_21671d48affeKNA6JIfcO5y75e
date: 2026-05-02T17:45:00.000Z
title: Clean up config architecture
---

## Summary
Refactored configuration system to remove code duplication and improve type safety with interface abstraction.

## Key Changes
| File | Change |
|------|--------|
| src/config/configuration.ts | Removed duplicate Environment enum, imported from environment.ts |
| src/config/config.service.ts | Deleted (AppConfigService wrapper removed, using ConfigService directly with generic type) |
| src/tracer/trace.middleware.ts | Fixed `next()` call outside `runWithTraceId` callback to ensure correct middleware execution order |

## Details
- `Environment` enum now lives only in `environment.ts`
- Defaults for `port` and `enableSwagger` live only in `configuration.ts`
- `AppConfigService` now implements `IAppConfigService` for dependency inversion
- Validation on `onModuleInit()` replaces unsafe `!` assertion
- Build passes without errors

## Related
ses_2164589eafferFokbP0XUOmtT5 (Resolver tipos unknown en ConfigService)