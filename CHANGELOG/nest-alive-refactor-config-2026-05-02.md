---
session_id: nest-alive-refactor-config-2026-05-02
date: 2026-05-02T13:40:51.282Z
title: Refactor to @nestjs/config
---

## Summary
Migrated from manual dotenv loading to NestJS ConfigModule for environment variable management, following NestJS best practices.

## Key Changes
| File | Change |
|------|--------|
| package.json | Added @nestjs/config dependency |
| src/config/configuration.ts | Created new configuration factory using registerAs |
| src/config/environment.ts | Simplified to export enum and interface only |
| src/app.module.ts | Added ConfigModule.forRoot with envFilePath and load |
| src/main.ts | Removed manual dotenv, now uses ConfigService injection |
| package.json | Simplified npm scripts to use NODE_ENV instead of ENV_FILE |

## Bug Fixes
| File | Change |
|------|--------|
| src/app.module.ts | Fixed envFilePath to use single env file based on NODE_ENV instead of array |

## Related
Consider adding Joi validation schema for env vars in a follow-up