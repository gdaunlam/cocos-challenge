---
session_id: ses_20c28fc4dffeMaH1xsMhd4umYm
date: 2026-05-04T21:15:00.000Z
title: Eliminar health endpoint + pg_trgm similarity search
---

## Summary
Eliminé el endpoint health de todos los archivos de test y松了口气 (ya no existía en controllers). Implementé pg_trgm similarity search para instrumentos usando PostgreSQL, reemplazando el filtering in-memory.

## Key Changes
| File | Change |
|------|--------|
| `src/app.e2e-spec.ts` | Eliminado describe block de "Health Endpoint" |
| `src/tracer/trace.integration.spec.ts` | Reemplazado `/instruments/health` → `/instruments/search` en todos los mocks |
| `src/logger/logger.middleware.spec.ts` | Reemplazado `/instruments/health` y `/health` → `/instruments/search` |
| `src/database/migrations/1700000000003-AddPgTrgmIndexes.ts` | Migration para índices gin con pg_trgm |
| `src/domain/instrument/instrument.repository.ts` | Agregado método abstract `findWithSimilarity()` |
| `src/domain/instrument/instrument.repository.impl.ts` | Implementado `findWithSimilarity()` con SQL similarity() |
| `src/domain/instrument/instrument-search.service.ts` | Refactorizado para usar `findWithSimilarity()` en lugar de filter/sort in-memory |
| `docs/TODO.md` | Marcado REST API como "Hecho", pg_trgm como "Hecho", eliminado "trabajar con arrays de ids" |

## pg_trgm SQL implementado
```sql
GREATEST(
  similarity(ticker, $1) * 0.7,
  similarity(name, $1) * 0.3
) AS score
ORDER BY score DESC
LIMIT $3 OFFSET $4;
```

## Verify
- Build ✅
- Lint ✅ (3 warnings - eslint-disable en specs)
- Tests ✅ 71 passed