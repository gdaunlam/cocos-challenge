---
session_id: ses_2060f8083ffeBbBnGiRQgm3Hhi
date: 2026-05-05T15:30:00.000Z
title: Eliminado type del body en Postman - se infiere del price
---

## Summary
Eliminado el campo `type` del body en la colección Postman. El tipo de orden (MARKET/LIMIT) ahora se infiere del `price`:
- Sin `price` → MARKET
- Con `price` → LIMIT

## Key Changes
| File | Change |
|------|--------|
| docs/POSTMAN/nest-alive-api.postman_collection.json | Eliminado `"type": "LIMIT"` del body de POST /order |

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)