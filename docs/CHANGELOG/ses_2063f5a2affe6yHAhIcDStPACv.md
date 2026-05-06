---
session_id: ses_2063f5a2affe6yHAhIcDStPACv
date: 2026-05-05T17:30:00.000Z
title: Mover validaciones de instrumentId/userId al controller con class-validator
---

## Summary
Movidas las validaciones de `instrumentId` y `userId` del OrderService al DTO `CreateOrderInput` usando `@IsNotEmpty`, `@IsNumber`, `@IsPositive` de class-validator.

## Key Changes
| File | Change |
|------|--------|
| src/domain/order/controller/order.interface.ts | Agregados `@IsNotEmpty()`, `@IsNumber()`, `@IsPositive()` en instrumentId y userId |
| src/domain/order/service/order.service.ts | Eliminadas las validaciones de instrumentId/userId |

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)