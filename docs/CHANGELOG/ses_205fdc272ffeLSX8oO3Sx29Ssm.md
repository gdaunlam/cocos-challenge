---
session_id: ses_205fdc272ffeLSX8oO3Sx29Ssm
date: 2026-05-05T18:05:00.000Z
title: Fix holdings/limit calculation for exchanged instrument in BUY orders
---

## Summary
Fixed bug where exchanged (ARS) holdings and limit were decremented by `order.size` instead of `order.size * order.price`. The formula is now applied directly without abstract converter pattern.

## Key Changes
| File | Change |
|------|--------|
| src/domain/shared/order-strategies.ts | BUY_FILLED: exchanged holdings/limit now use `order.size * order.price` |
| src/domain/shared/order-strategies.ts | SELL_FILLED: exchanged holdings/limit now use `order.size * order.price` |

## Details
- **BUY**: exchanged is ARS, so `holdings -= size * price` and `limit -= size * price`
- **SELL**: exchanged is the target instrument, so `holdings += size * price` and `limit += size * price`
- `debit` and `credit` operations use same `size * price` formula

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)