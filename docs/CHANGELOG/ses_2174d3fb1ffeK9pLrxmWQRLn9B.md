---
session_id: ses_2174d3fb1ffeK9pLrxmWQRLn9B
date: 2026-05-02T15:46:47.671Z
title: Configuración tipada de environments
---

## Summary
Se creó un módulo centralizado de configuración de environments con tipos TypeScript y validación de valores.

## Key Changes
| File | Change |
|------|--------|
| src/config/environment.ts | `environment` changed to `getEnvironment()` function called after dotenv loads |
| src/main.ts | Now calls `getEnvironment()` inside `bootstrap()` after `dotenv` loads the env file |
| package.json | Added start:dev, start:staging, start:prod scripts |
| .envs/.development | Created development env file |
| .envs/.staging | Created staging env file |
| .envs/.production | Created production env file |
| cross-env | Added as dev dependency |
| package.json | Added `typecheck` script using `tsc --noEmit` |
| .husky/pre-commit | Now runs `npm run typecheck` before build |

## Details
- **Environment enum**: Development, Staging, Production
- **ENV_FILE**: Env var that specifies which .envs file to load
- **Single source of truth**: All env vars centralized in `src/config/environment.ts`
- **Scripts**: `npm run start:dev`, `npm run start:staging`, `npm run start:prod`
- **Swagger**: Controlled via ENABLE_SWAGGER env var (true in dev/staging, false in prod)

## Last Updated
2026-05-02T16:24:00.000Z

## Key Changes
| File | Change |
|------|--------|
| jest.config.js | Created Jest configuration |
| src/domain/instruments/instruments.service.spec.ts | Created unit tests for InstrumentsService |
| package.json | Added jest, @nestjs/testing, @types/jest, ts-jest as devDependencies; Added test script |
| tsconfig.json | Added "jest" to types array |