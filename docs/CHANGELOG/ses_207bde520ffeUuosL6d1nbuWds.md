---
session_id: ses_207bde520ffeUuosL6d1nbuWds
date: 2026-05-05T14:20:00.000Z
title: Migration config ahora apunta a src en lugar de dist
---

## Summary
Corregido el problema donde migraciones old en `dist/` causaban errores de "relation already exists". El `typeorm-cli.config.ts` ahora apunta a `src/database/migrations/*.ts` en lugar de `dist/`, evitando que se ejecuten migraciones huérfanas compiladas.

## Key Changes
| File | Change |
|------|--------|
| typeorm-cli.config.ts | Cambiado path de migraciones de `dist/` a `src/database/migrations/` |

## Details
- El glob ahora es `join(process.cwd(), 'src', 'database', 'migrations', '*.ts')`
- Esto evita que migraciones old en `dist/` se ejecuten y causen errores

## Related
ses_207267fe8ffeb5YIJFYtdcmzM0 (ID requerido al crear Order)