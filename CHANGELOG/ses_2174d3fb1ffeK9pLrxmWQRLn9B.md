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
| src/config/environment.ts | Created with Environment enum and typed configuration |
| src/main.ts | Uses ENV_FILE env var to load specific env file, dotenv config with dynamic path |
| package.json | Added start:dev, start:staging, start:prod scripts |
| .envs/.development | Created development env file |
| .envs/.staging | Created staging env file |
| .envs/.production | Created production env file |
| cross-env | Added as dev dependency |

## Details
- **Environment enum**: Development, Staging, Production
- **ENV_FILE**: Env var that specifies which .envs file to load
- **Single source of truth**: All env vars centralized in `src/config/environment.ts`
- **Scripts**: `npm run start:dev`, `npm run start:staging`, `npm run start:prod`
- **Swagger**: Controlled via ENABLE_SWAGGER env var (true in dev/staging, false in prod)