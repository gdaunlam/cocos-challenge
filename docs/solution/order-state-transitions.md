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

| Side | Status | target debit | target holdings | target credit | target limit | exchanged debit | exchanged holdings |
|------|--------|--------------|-----------------|---------------|--------------|-----------------|---------------------|
| BUY | NEW | - | - | - | - | `credit -= size*price` | `limit -= size` |
| BUY | FILLED | `debit += size*price` | `holdings += size` | `credit += size*price` | `limit += size` | `debit -= size*price` | `holdings -= size` |
| BUY | CANCELLED | - | - | - | - | `credit += size*price` | `limit += size` |
| BUY | REJECTED | - | - | - | - | `credit += size*price` | `limit += size` |
| SELL | NEW | - | - | `credit -= size*price` | `limit -= size` | - | - |
| SELL | FILLED | `debit -= size*price` | `holdings -= size` | - | `limit -= size` | `debit += size*price` | `holdings += size` |
| SELL | CANCELLED | - | - | `credit += size*price` | `limit += size` | - | - |
| SELL | REJECTED | - | - | `credit += size*price` | `limit += size` | - | - |
| CASH_IN | FILLED | `debit += size` | `holdings += size` | `credit += size` | `limit += size` | - | - |
| CASH_OUT | FILLED | `debit -= size` | `holdings -= size` | `credit -= size` | `limit -= size` | - | - |

---

## Complete Example: Buy and Sell Cycle

### Initial State
```
Portfolio:
  INSTRUMENT_A: debit=0, holdings=0, credit=0, limit=0
  INSTRUMENT_B: debit=10000, holdings=10000, credit=10000, limit=10000
```

### Step 1: BUY NEW
Creates order: 10 @ price 100

```
Note: Only credit/limit changes. No actual exchange yet.
  INSTRUMENT_A: credit -= 10*100 = 1000, limit -= 10
  INSTRUMENT_B: credit -= 10*100 = 1000, limit -= 10

Portfolio after BUY NEW:
  INSTRUMENT_A: debit=0, holdings=0, credit=0, limit=0
  INSTRUMENT_B: debit=10000, holdings=10000, credit=9000, limit=9990
```

### Step 2: BUY FILLED
Order executes.

```
For BUY FILLED:
  target (INSTRUMENT_A): debit += 1000, holdings += 10, credit += 1000, limit += 10
  exchanged (INSTRUMENT_B): debit -= 1000, holdings -= 10

Portfolio after BUY FILLED:
  INSTRUMENT_A: debit=1000, holdings=10, credit=1000, limit=10
  INSTRUMENT_B: debit=9000, holdings=9000, credit=9000, limit=9990
```

### Step 3: SELL NEW
Creates SELL order: 5 @ price 120

```
For SELL NEW:
  target (INSTRUMENT_A): credit -= 5*120 = 600, limit -= 5

Portfolio after SELL NEW:
  INSTRUMENT_A: debit=1000, holdings=10, credit=400, limit=5
  INSTRUMENT_B: debit=9000, holdings=9000, credit=9000, limit=9990
```

### Step 4: SELL FILLED
Order executes at 120.

```
For SELL FILLED:
  target (INSTRUMENT_A): debit -= 5*120 = 600, holdings -= 5, limit -= 5
  exchanged (INSTRUMENT_B): debit += 600, holdings += 6, credit += 600, limit += 6

Portfolio after SELL FILLED:
  INSTRUMENT_A: debit=400, holdings=5, credit=400, limit=0
  INSTRUMENT_B: debit=9600, holdings=9600, credit=9600, limit=9990
```

### What happened?
- Started with 0 of INSTRUMENT_A, 10000 of INSTRUMENT_B
- Bought 10 @ 100 (cost 1000)
- Sold 5 @ 120 (earned 600)
- Final: 5 of INSTRUMENT_A, 9600 of INSTRUMENT_B

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