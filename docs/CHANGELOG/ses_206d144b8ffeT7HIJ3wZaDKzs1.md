---
session_id: ses_206d144b8ffeT7HIJ3wZaDKzs1
date: 2026-05-05T18:36:51.000Z
title: Cambiar routes de controllers a singular (REST)
---

## Summary
Cambio de rutas de controllers de plural a singular siguiendo convención REST. Los recursos ahora son singulares: `/order`, `/instrument`, `/portfolio`.

## Key Changes
| File | Change |
|------|--------|
| src/domain/order/controller/order.controller.ts | `@Controller('orders')` → `@Controller('order')` |
| src/domain/instrument/controller/instrument-search.controller.ts | `@Controller('instruments')` → `@Controller('instrument')` |
| docs/POSTMAN/nest-alive-api.postman_collection.json | `/orders` → `/order`, `/instruments/search` → `/instrument/search` |
| docs/POSTMAN/nest-alive-api.postman_collection.json | Eliminado `type` del body (se infiere del `price`: sin price=MARKET, con price=LIMIT) |
| src/tracer/trace.integration.spec.ts | 6 refs `/instruments*` → `/instrument*` |
| src/logger/logger.middleware.spec.ts | 9 refs `/instruments*` → `/instrument*` |

## Related
Build y tests pasan (71 passed). Portfolio controller ya estaba en singular.
