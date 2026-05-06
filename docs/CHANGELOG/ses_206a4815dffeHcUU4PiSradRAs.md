---
session_id: ses_206a4815dffeHcUU4PiSradRAs
date: 2026-05-05T16:20:00.000Z
title: Mover validacion de longitud minima al DTO con @MinLength(3)
---

## Summary
Movida la validación de `query` (mínimo 3 caracteres) del `InstrumentSearchService.validateInput()` al DTO `SearchInstrumentsQueryDto` usando `@MinLength(3)` de class-validator.

## Key Changes
| File | Change |
|------|--------|
| src/domain/instrument/controller/instrument-search.query.dto.ts | Agregado `@MinLength(3)` en `q`, importado `MinLength` |
| src/domain/instrument/service/instrument-search.service.ts | Eliminado `validateInput()` method |

## Details
- `@MinLength(3)` valida que el query tenga al menos 3 caracteres
- El método `validateInput()` del service fue eliminado ya que la validación ahora ocurre via Pipes

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)