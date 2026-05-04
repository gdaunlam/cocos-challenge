---
session_id: ses_2199dfd79fferFPElz7FCHfVe4
date: 2026-05-02T18:34:00.000Z
title: Remove AppConfigService wrapper
---

## Summary
Eliminated `AppConfigService` class that only existed for typing. Now using `ConfigService` directly with proper generic type `IEnvironmentConfig`.

## Key Changes
| File | Change |
|------|--------|
| src/config/config.service.ts | Deleted |
| src/main.ts | Uses `ConfigService.get<IEnvironmentConfig>('environment')` directly |
| src/app.module.ts | Removed `AppConfigService` from providers array |

## Related
Previously `AppConfigService` was a wrapper class with `OnModuleInit` validation. Now typed config is achieved through generic parameter on `ConfigService.get<T>()`.