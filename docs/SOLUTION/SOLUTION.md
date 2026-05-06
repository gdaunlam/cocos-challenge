# Solutions - Cocos Challenge

## Portfolio - Punto 1

### Valor Total Monetario de cada Posición

**Cálculo de cantidad de acciones:**
```
quantity = Σ (size * side_multiplier)
  donde BUY = +1, SELL = -1
```

**Cálculo del costo real (cost basis):**
```
costBasis = Σ (size * price) para todas las órdenes BUY FILLED
```

**Valor de mercado:**
```
marketValue = quantity * close_actual
```

**Rendimiento total (%):**
```
totalReturnPercentage = (marketValue - costBasis) / costBasis * 100
```

### Pesos Totales en la Cuenta

**Cash disponible =**
```
CASH_DISPONIBLE = 0
CASH_RESERVADO = 0

Para cada orden FILLED:
  - CASH_IN:  CASH_DISPONIBLE += size
  - CASH_OUT: CASH_DISPONIBLE -= size
  - BUY:      CASH_DISPONIBLE -= size * price
  - SELL:     CASH_DISPONIBLE += size * price

Para cada orden NEW (LIMIT BUY):
  CASH_RESERVADO += size * price

CASH_REAL_DISPONIBLE = CASH_DISPONIBLE - CASH_RESERVADO
```

**Flujo de validación al crear orden LIMIT BUY:**
```
size * price <= CASH_REAL_DISPONIBLE
```

**Flujo de ejecución:**
- LIMIT BUY pasa a FILLED: `CASH_DISPONIBLE -= size * price` (ya estaba reservado, ahora se confirma)
- LIMIT BUY pasa a CANCELLED: No se toca CASH_DISPONIBLE (nunca se tocó)

### Diseño - Patrones Utilizados

**Service + Calculator Strategy:**

```typescript
// CashCalculator: responsabilidad única para cash
class CashCalculator {
  calculateCash(): { available: number; reserved: number }
}

// PositionCalculator: responsabilidad única para posiciones
class PositionCalculator {
  calculatePositions(): Position[]
}

// PortfolioService: orquesta y组装
class PortfolioService {
  calculatePortfolio(): PortfolioBody
}
```

**Ventajas:**
- Cada Calculator es testeable aisladamente
- Separación de concerns clara
- Fácil de extender (ej: otro tipo de rendimiento)

### Decisiones de Diseño

1. **ARS se determina dinámicamente**: Se busca el instrumento con `InstrumentType.MONEDA` en runtime, no se usa un instrumentId hardcodeado. Esto permite flexibilidad si los IDs de instrumentos cambian.
2. **Market data se ordena por fecha**: Se usa el más reciente (2023-07-14) para precios fallback
3. **Precios de mercado**: Se priorizan órdenes FILLED (más reciente), fallback a marketdata.close
4. **Órdenes FILLED únicamente**: Solo las órdenes ejecutadas cuentan para posiciones y cash real
5. **Instrumentos sin marketdata**: Se skippean porque no tienen precio actual

## Arquitectura de Entities

```
src/domain/
├── shared/
│   ├── entities/
│   │   ├── order.entity.ts        # Order, Side, Status, OrderType
│   │   ├── instrument.entity.ts   # Instrument, InstrumentType
│   │   ├── marketdata.entity.ts   # MarketData
│   │   └── user.entity.ts         # User
│   ├── portfolio-status-builder.ts  # Builds InstrumentStatusMap from orders
│   ├── market-prices-resolver.ts    # Resolves market prices (orders FILLED → marketdata fallback)
│   ├── order-strategies.ts          # Strategies (shared)
│   └── instrument-status.ts        # InstrumentStatus (shared)
├── portfolio/
│   ├── portfolio-service.ts       # Portfolio presentation module
│   ├── entities/portfolio.entity.ts
│   └── __tests__/
└── order/
    ├── order-service.ts           # Order presentation module
    └── __tests__/
```

## Order - Punto 3

### CreateOrderInput

```typescript
interface CreateOrderInput {
  instrumentId: number;
  userId: number;
  side: 'BUY' | 'SELL';
  quantity?: number;  // acciones exactas
  amount?: number;   // monto en pesos (mutuamente excluyente con quantity)
  price?: number;     // si presente → LIMIT, else → MARKET
}
```

**Reglas:**
- `quantity XOR amount`: uno y solo uno debe estar presente
- `price` determina el tipo: si existe → LIMIT, si no → MARKET

### Validación de Órdenes

**BUY:** Se valida contra `arsStatus.credit` (cash disponible + reservado ya deducido)
```
totalCost = size * price
totalCost <= arsStatus.credit → válido
```

**SELL:** Se valida contra `targetStatus.limit` (holdings - reservados en SELL NEW)
```
size <= targetStatus.limit → válido
```

### Lógica de Creación

| Tipo | Validación pasa | Estado |
|------|-----------------|--------|
| BUY MARKET | sí | FILLED |
| BUY LIMIT | sí | NEW |
| SELL MARKET | sí | FILLED |
| SELL LIMIT | sí | NEW |
| BUY/SELL | no | REJECTED |

### Cálculo de Shares desde Amount

Cuando se envía `amount` en vez de `quantity`:
```
maxShares = floor(amount / price)
```

### Notas de Implementación

1. **MARKET orders**: El precio se toma del `close` más reciente en marketdata
2. **LIMIT orders**: El precio es el enviado por el usuario
3. **El módulo es stateless**: Solo persiste la orden creada en memoria; el portfolio se recalcula dinámicamente
4. **Módulo de presentación**: Ambos módulos (portfolio y order) son módulos de presentación que responden a los endpoints del challenge
5. **ARS instrumentId = 67**: weapon ID para efectivo en pesos

### Validaciones de Input

- `instrumentId` > 0
- `userId` > 0
- `quantity XOR amount`: uno y solo uno debe estar presente
- `price > 0` para LIMIT
- `effectiveSize > 0`: amount/price debe resultar en al menos 1 acción
- Market data disponible para el instrumento (para MARKET orders)

## Instrument Search - Punto 4

### SearchInstrumentsInput

```typescript
interface SearchInstrumentsInput {
  query: string;           // min 3 characters
  type?: InstrumentType;  // optional filter (ACCIONES | MONEDA)
  searchBy?: 'ticker' | 'name' | 'both';  // default: 'both'
  page: number;            // 1-indexed
  limit: number;           // > 0, required (no default)
}
```

### SearchInstrumentsOutput

```typescript
interface SearchInstrumentsOutput {
  results: Array<{
    id: number;
    ticker: string;
    name: string;
    type: InstrumentType;
    score: number;         // 0-1 (composite relevance)
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Scoring Algorithm

PostgreSQL with `pg_trgm` extension:

```sql
-- searchBy = 'ticker'
score = similarity(ticker, query)

-- searchBy = 'name'
score = similarity(name, query)

-- searchBy = 'both' (default)
score = GREATEST(
  similarity(ticker, query) * 0.7,
  similarity(name, query) * 0.3
)

ORDER BY score DESC
LIMIT {limit} OFFSET {offset};
```

**Rationale:**
- `ticker` has higher weight (0.7) because it's shorter, making matches more significant
- `name` has lower weight (0.3) because it's a larger surface area
- `GREATEST()` ensures we capture the best match from either field

### Validaciones de Input

- `query.length < 3` → Error: "query must be at least 3 characters"
- `page <= 0` → Error: "page must be a positive number"
- `limit <= 0` → Error: "limit must be a positive number"

### Índice PostgreSQL Sugerido

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_instruments_ticker_trgm ON instruments USING gin (ticker gin_trgm_ops);
CREATE INDEX idx_instruments_name_trgm ON instruments USING gin (name gin_trgm_ops);
```

### Arquitectura

```
src/domain/
├── instrument/
│   ├── instrument-repository.ts    # Repository interface
│   ├── instrument-search-service.ts
│   └── __tests__/
└── shared/entities/instrument.entity.ts
```

### Notas de Implementación

1. **In-memory dummy**: Initial implementation uses naive string matching for testing
2. **Swappable to SQL**: Repository interface allows swapping to PostgreSQL pg_trgm without changing service logic
3. **Always returns results**: No minimum score threshold; all matches are returned
4. **Type filter**: Optional filter by `InstrumentType` is applied before scoring

## Cache System

### Diseño

**Decorator de Cache + Singleton:**

```typescript
// Singleton que maneja la cache con circular buffer
class CacheService {
  private cache: Map<string, CacheEntry>;
  private order: string[];  // for LRU eviction
  private maxSize: number;
}

// Decorator que conecta método con cache
function cached(
  cacheKey: string,
  identityFn: (this: any, ...args: any[]) => string
): MethodDecorator
```

### Identity Functions

**Search Instruments:**
```typescript
@cached('search', (input: SearchInstrumentsInput) =>
  `search:${input.query}:${input.type ?? 'all'}:${input.searchBy ?? 'both'}:${input.page}:${input.limit}`
)
async search(input: SearchInstrumentsInput): Promise<SearchInstrumentsOutput> { ... }
```

**Calculate Portfolio:**
```typescript
@cached('portfolio', function() { return `portfolio:${this.userId}`; })
calculatePortfolio(): PortfolioBody { ... }
```

### Invalidation Strategy

- **Portfolio cache**: Se invalida cuando se crea una orden (via `cacheService.invalidatePrefix('portfolio')`)
- **Search cache**: No tiene invalidación automática (query es stateless)

### Circular Buffer (LRU)

```typescript
private evictIfNeeded(): void {
  if (this.order.length >= this.maxSize) {
    const oldest = this.order.shift();
    this.cache.delete(oldest);
  }
}
```

### Arquitectura

```
src/
├── shared/
│   └── cache/
│       ├── cache-service.ts      # Singleton con Map + order array
│       ├── cache-entry.ts        # { value, timestamp }
│       ├── cached-decorator.ts   # MethodDecorator factory
│       └── index.ts             # exports
```

### Configuración Requerida

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

(End of file - total 269 lines)
