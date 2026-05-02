---
session_id: ses_2173c1fb1ffeY8rKqxmWQRLn9A
date: 2026-05-02T15:23:52.268Z
title: Agregar environments con .envs por entorno
---

## Summary
Se formalizó la configuración de environments creando archivos `.envs` por entorno (development, staging, production). El de production tiene swagger deshabilitado.

## Key Changes
| File | Change |
|------|--------|
| .envs/.development | Created with ENABLE_SWAGGER=true, NODE_ENV=development |
| .envs/.staging | Created with ENABLE_SWAGGER=true, NODE_ENV=staging |
| .envs/.production | Created with ENABLE_SWAGGER=false, NODE_ENV=production |
| src/main.ts | Added dotenv loading based on NODE_ENV |
| package.json | Added dotenv dependency |
| .gitignore | Added .envs to ignored files |

## Related
Pendiente: asegurar que NODE_ENV se setee al ejecutar npm start