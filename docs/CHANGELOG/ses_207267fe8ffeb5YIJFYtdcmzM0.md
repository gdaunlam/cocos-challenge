---
session_id: ses_207267fe8ffeb5YIJFYtdcmzM0
date: 2026-05-05T14:35:00.000Z
title: ID requerido al crear Order - SaveOrderDto y sequence fix
---

## Summary
Problema resuelto al crear órdenes: el ID de la orden se genera automáticamente en PostgreSQL. Se creó el tipo `SaveOrderDto = Omit<Order, 'id'>` para no requerir ID al crear. Se creó la migración `1700000000005-FixOrdersSequence` para corregir el sequence de PostgreSQL que quedó desincronizado después del seed.

## Key Changes
| File | Change |
|------|--------|
| src/domain/order/repository/order.repository.impl.ts | Creado `export type SaveOrderDto = Omit<Order, 'id'>` |
| src/domain/order/service/order.service.ts | Usa `SaveOrderDto` en lugar de `Order` para crear órdenes |
| src/database/entities/order.entity.ts | `id` sigue siendo `number` con `@PrimaryGeneratedColumn()` |
| src/database/migrations/1700000000005-FixOrdersSequence.ts | Migration para corregir sequence de orders |

## Details
- `SaveOrderDto` omite `id` ya que PostgreSQL lo genera automáticamente con SERIAL
- La migración 5 ejecuta `SELECT setval('orders_id_seq', MAX(id)+1)` para sincronizar el sequence

## Related
ses_207bde520ffeUuosL6d1nbuWds (Postgres tabla instruments ya existe)