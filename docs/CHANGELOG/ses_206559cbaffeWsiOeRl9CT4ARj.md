---
session_id: ses_206559cbaffeWsiOeRl9CT4ARj
date: 2026-05-05T16:55:00.000Z
title: Fix order.size devuelve string - removido decimal del Column
---

## Summary
Problema resuelto: `order.size` era string desde PostgreSQL porque `@Column('decimal')` en TypeORM hace que devuelva strings para evitar problemas de precision.

## Key Changes
| File | Change |
|------|--------|
| src/database/entities/order.entity.ts | Removido `'decimal'` del `@Column()` en `size` y `price` |

## Details
- Antes: `@Column('decimal')` hacia que PostgreSQL devolviera strings
- Ahora: `@Column()` sin tipo (TypeORM infiere de TypeScript `number`)
- TypeORM maneja la conversion automaticamente

## Related
ses_20563ab75ffeKo0LTywy34Fz3U (revision y actualizacion de docs)