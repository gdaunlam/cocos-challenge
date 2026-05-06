---
session_id: ses_206215db7ffeceaOlQ9157qnOb
date: 2026-05-05T16:00:00.000Z
title: Clarificar significado de REJECTED en REQUIREMENT.md
---

## Summary
Clarificado el significado de `REJECTED` según REQUIREMENT.md:
- BUY: rechazado cuando el usuario no tiene los pesos suficientes
- SELL: rechazado cuando el usuario no tiene las acciones suficientes

## Details
- REJECTED es un estado final de la orden (no se recupera)
- A diferencia de CANCELLED que puede revertirse, REJECTED indica que la orden nunca se ejecutó ni se ejecutará

## Related
ses_206d144b8ffeT7HIJ3wZaDKzs1 (routes singular)