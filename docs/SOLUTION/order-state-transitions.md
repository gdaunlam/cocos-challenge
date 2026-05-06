# Order State Transitions

Every order transitions through states and modifies the user's portfolio. This document describes exactly what happens to each instrument during each transition.

---

## Core Concept: Two Instruments Per Trade

Every BUY or SELL involves **two instruments**:

| Instrument | Role | Description |
|------------|------|-------------|
| `target_instrument` | The asset you're trading | BUY = what you receive, SELL = what you give |
| `exchanged_instrument` | Counterpart instrument | The other side of the transaction |

**Example: Buy 10 @ 100**
- target = what you receive
- exchanged = what you give

**Example: Sell 10 @ 100**
- target = what you give
- exchanged = what you receive

---

## Sign Convention

| Symbol | Meaning |
|--------|---------|
| `+=` | You **receive** this value |
| `-=` | You **give** this value |

---

## Instrument Fields

Each instrument has four fields:

| Field | Description |
|-------|-------------|
| `debit` | Accumulated value / invested amount |
| `credit` | Portion available to reserve for new orders |
| `holdings` | Quantity possessed |
| `limit` | Portion of holdings available to reserve |

### Field Lifecycle

```
[NEW order created]
    ↓
credit/limit decreases (reserves are blocked)
    ↓
[If FILLED]
    ↓
credit/limit increases (reserves consumed, new units become available)
    OR
[If CANCELLED/REJECTED]
    ↓
credit/limit increases (reserves released back)
```

### Why does FILLED increase credit/limit?

When a BUY or SELL order FILLS:
- The reserved amount is **consumed** (no longer just reserved)
- The **newly acquired units** now become part of credit/limit (you can trade them)
- So net effect: reserved decreases, newly acquired increases → credit/limit goes UP

---

## State Transition Table

| Side | Status | target_debit | target_holdings | target_credit | target_limit | exchanged_debit | exchanged_holdings | exchanged_credit | exchanged_limit |
|------|--------|--------------|-----------------|---------------|--------------|-----------------|-------------------|------------------|-----------------|
| BUY | NEW | - | - | - | - | - | - | `credit -= size*price` | `limit -= size*price` |
| BUY | FILLED | `debit += size*price` | `holdings += size` | `credit += size*price` | `limit += size` | `debit -= size*price` | `holdings -= size*price` | `credit -= size*price` | `limit -= size*price` |
| BUY | CANCELLED | - | - | - | - | - | - | - | - |
| BUY | REJECTED | - | - | - | - | - | - | - | - |
| SELL | NEW | - | - | `credit -= size*price` | `limit -= size*price` | - | - | - | - |
| SELL | FILLED | `debit -= size*price` | `holdings -= size` | `credit -= size*price` | `limit -= size` | `debit += size*price` | `holdings += size*price` | `credit += size*price` | `limit += size*price` |
| SELL | CANCELLED | - | - | `credit += size*price` | `limit += size` | - | - | - | - |
| SELL | REJECTED | - | - | `credit += size*price` | `limit += size` | - | - | - | - |
| CASH_IN | FILLED | `debit += size*price` | `holdings += size*price` | `credit += size*price` | `limit += size*price` | - | - | - | - |
| CASH_OUT | FILLED | `debit -= size*price` | `holdings -= size*price` | `credit -= size*price` | `limit -= size*price` | - | - | - | - |

---

## Glossary

| Term | Definition |
|------|------------|
| `debit` | Accumulated value / invested amount. Represents the cost basis or total value held. |
| `credit` | Portion available to reserve for new orders. Decreased in NEW, increased on FILLED/CANCELLED/REJECTED. |
| `holdings` | Quantity possessed / held |
| `limit` | Portion of holdings available to reserve. Decreased in NEW, increased on FILLED/CANCELLED/REJECTED. |
| CASH_IN | Deposit into portfolio |
| CASH_OUT | Withdraw from portfolio |