---
session_id: ses_206112c27ffeEz8IPNZd7m7mc1
date: 2026-05-05T15:15:00.000Z
title: Actualizar order-state-transitions.md para coincidir con el codigo
---

## Summary
Actualizado el documento para que coincida con `order-strategies.ts`:
- BUY_NEW: exchanged_limit ahora usa `size*price` (no `size`)
- BUY_CANCELLED/REJECTED: ahora muestran `-` (no hacen nada, empty functions)
- SELL_NEW: target_limit ahora usa `size*price` (no `size`)
- CASH_IN/CASH_OUT: todos los campos ahora usan `size*price` (no `size`)
- Eliminado el ejemplo numérico (era costoso de mantener)

## Key Changes
| File | Change |
|------|--------|
| docs/SOLUTION/order-state-transitions.md | Corregida tabla: BUY_NEW exchanged_limit, SELL_NEW target_limit, CASH_IN/CASH_OUT |
| docs/SOLUTION/order-state-transitions.md | BUY_CANCELLED y BUY_REJECTED ahora muestran `-` |
| docs/SOLUTION/order-state-transitions.md | Eliminado "Complete Example" (líneas 88-153) |

## Related
ses_20563ab75ffeKo0LTywy34Fz3U (revision y actualizacion de docs)