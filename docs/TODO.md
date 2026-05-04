# TODO - Nest Alive

## DISCARDED
    segurización (infra level)
        rate limit: WAF/firewall - no requerido en código
        whitelist: WAF/firewall - no requerido en código
    segurización (N/A sin auth usuarios)
        jwt: N/A - sin auth de usuarios no aplica
        authentication: N/A - sin auth de usuarios no aplica
        authorization: N/A - sin auth de usuarios no aplica
        csrf: N/A - sin cookies/sessions no aplica
        content security policy: N/A - mas relevant para front-end que serve

## DONE
    swagger
        @nestjs/swagger integrado, DocumentBuilder en main.ts, /api route
        Toggle: ENABLE_SWAGGER env var (false en production)
    nodemon en development
        Script: start:dev:watch con nodemon --exec npm run lint && ts-node src/main.ts
    validación de endpoints
        datos de entrada en body: ValidationPipe global + class-validator en CreateInstrumentRequest
        invalidar datos extras no permitidos: whitelist: true, forbidNonWhitelisted: true en ValidationPipe
        query params: GetInstrumentsQueryDto con @Query() + class-validator (page, limit)
        path params: DeleteInstrumentParamDto con @Param() + class-validator (name)
    environments
        development, staging, production en .envs/
        Scripts: npm run start:dev, start:staging, start:prod (cross-env)
    errors
        handler general: TraceExceptionFilter con APP_FILTER
        manejo de errores custom: HttpException personalizada en trace.filter.ts
        respuesta uniforme: trace ID incluido en error responses
    loggin
        error: TraceLogger con trace ID en todos los logs
        x-trace-id: extraido/creado en TraceMiddleware via AsyncLocalStorage
    testing
        coverage: jest con spec files junto al codigo
        Tests: trace.service.spec.ts, trace.integration.spec.ts, logger.middleware.spec.ts, configuration.spec.ts, app.e2e-spec.ts
    husky
        pre-commit hook: npm run lint && npm run typecheck && npm run test && npm run build
    standares
        eslint, prettier, no any, sin variables no usadas
        Configurado via eslintrc + tsconfig strict
    conexión a bd
        pool de conexiones: TypeOrmModule.forRootAsync con configuracion
        orm: @nestjs/typeorm + typeorm + pg
        migraciones: TypeORM CLI con typeorm-cli.config.ts
        dockercompose: PostgreSQL 16 container en docker-compose.yml
    trace id system
        middleware: TraceMiddleware en app.module.ts
        interceptor: TraceInterceptor con APP_INTERCEPTOR
        exception filter: TraceExceptionFilter con APP_FILTER
        logger: TraceLogger con trace ID
    segurización
        helmet: app.use(helmet()) en main.ts
        cors: app.use(cors()) en main.ts

## TODO
    requerimiento
        aplicación
        casos de uso
        arquitectura
        no romper si no hace falta en los endpoints
    documentación
        funcionamiento del sistema por topicos
        diagrama
        colección de postman
        actualizar swagger

---

## REST API (Hecho)

Implementar API REST con Express o NestJS.

### Endpoints implementados

1. **GET /portfolio/:userId**
   - Retorna `PortfolioBody` con totalValue, availableCash, positions
   - Delegar a `PortfolioService.calculatePortfolio()`

2. **GET /instruments/search?q=&type=&searchBy=&page=&limit=**
   - Query params: `q` (min 3 chars), `type` (ACCIONES|MONEDA), `searchBy` (ticker|name|both), `page`, `limit`
   - Retorna `SearchInstrumentsOutput` con results y pagination
   - Delegar a `InstrumentSearchService.search()`

3. **POST /orders**
   - Body: `{ instrumentId, userId, side, quantity?, amount?, price? }`
   - Crear orden via `OrderService.createOrder()`
   - Retornar la orden creada

### Notas de implementación

- No requiere autenticación (según consigna)
- El test funcional sobre crear órdenes ya existe en `src/domain/order/order.service.spec.ts`

---

## Base de datos PostgreSQL (Hecho)

Reemplazar datos en memoria (`data.json`) con conexión real a PostgreSQL.

### Tablas existentes

```sql
-- users: id, email, accountNumber
-- instruments: id, ticker, name, type
-- orders: id, instrumentId, userId, side, size, price, type, status, datetime
-- marketdata: id, instrumentId, high, low, open, close, previousClose, datetime
```

### Cambios requeridos

1. **Instalar cliente PostgreSQL** (pg, drizzle, prisma, etc.)
2. **Crear conexión a DB** con variables de entorno (DATABASE_URL)
3. **Refactorizar repositories:**
   - `InstrumentRepository`: queries a `instruments` y `marketdata`
   - Orders queries para `PortfolioStatusBuilder`
   - user queries para validación
4. **Ejecutar queries** en PortfolioService, OrderService, InstrumentSearchService

### Índices recomendados

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_instruments_ticker_trgm ON instruments USING gin (ticker gin_trgm_ops);
CREATE INDEX idx_instruments_name_trgm ON instruments USING gin (name gin_trgm_ops);
```

---

## Búsqueda con similarity - pg_trgm (Hecho)

Implementar búsqueda de instrumentos usando `similarity()` de PostgreSQL.

### SQL implementado

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

### Implementación

1. Migration `1700000000003-AddPgTrgmIndexes` crea índices gin con pg_trgm
2. Método `findWithSimilarity(query, searchBy, type, limit, offset)` en `InstrumentRepository`
3. `InstrumentSearchService` usa el nuevo método en lugar de filtering in-memory

---

## Opcional / Nice to have

- Proveer colección Postman, Insomnia o REST Client para la API
- Ejemplos de invocación de cada endpoint