---
session_id: ses_206808f1effeh9FgAj0CI0Nkxs
date: 2026-05-05T16:45:00.000Z
title: COUNT(*) OVER() para obtener total de resultados en busqueda
---

## Summary
Optimizada la query de búsqueda de instrumentos para obtener el total de resultados usando window function `COUNT(*) OVER()` en lugar de una query separada con límite arbitrario de 10000.

## Key Changes
| File | Change |
|------|--------|
| src/domain/instrument/repository/instrument.repository.impl.ts | Agregado `COUNT(*) OVER() AS total` en las 3 queries (ticker, name, both) |
| src/domain/instrument/service/instrument-search.service.ts | Eliminada segunda query para contar total; ahora usa `searchResults[0]?.total` |

## Details
- Una sola query en lugar de dos
- Sin límites arbitrarios
- Total correcto obtenido del primer resultado

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)