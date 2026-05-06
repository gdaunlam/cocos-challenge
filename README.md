# Nest Alive - TODO

## Como levantar el proyecto

```bash
docker compose up -d && npm run dev
```

- El proyecto cuenta con migraciones solo para development que agregan tablas y datos.
- Para conectar la API con una BD externa, usar `prod` o `stg` donde no se ejecutan migraciones sobre la BD.
- Si conecta una BD externa sobre `development`, probablemente fallarán las migraciones y generarán inconsistencias.

## Cambios sobre la BD

- Se agregó un índice GIN para la búsqueda similarity en los campos `ticker` y `name` de la tabla `instruments`.

## Consideraciones al enviar una orden al mercado

- El type es inferido: es `MARKET` cuando no se envía `price`, es `LIMIT` cuando se envía `price`.

## Consideraciones del Portfolio

### Cash disponible (availableCash)
- ✅ `NEW BUY` solo compromete dinero
- ✅ `NEW SELL` solo compromete acciones
- ❌ `CANCELLED` no afecta nada
- ❌ `REJECTED` no afecta nada

### Total Value vs availableCash
- ✅ `totalValue` usa órdenes `FILLED` para obtener el valor real de mercado de las posiciones
- ✅ `availableCash` descuenta además las órdenes `NEW` pendientes

### Posiciones
- ✅ Market value = cantidad × precio de la **última orden `FILLED`** del activo

---

## 🔥 DISCARDED

### 🔒 Segurización (infra level)
- rate limit: WAF/firewall - no requerido en código
- whitelist: WAF/firewall - no requerido en código

### 🔒 Segurización (N/A sin auth usuarios)
- jwt: N/A - sin auth de usuarios no aplica
- authentication: N/A - sin auth de usuarios no aplica
- authorization: N/A - sin auth de usuarios no aplica
- csrf: N/A - sin cookies/sessions no aplica
- content security policy: N/A - mas relevant para front-end que serve

---

## ✅ DONE

### Swagger
- @nestjs/swagger integrado, DocumentBuilder en main.ts, /api route
- Toggle: ENABLE_SWAGGER env var (false en production)
- Implementación: [main.ts:27-35](/src/main.ts#L27-L35)

### Nodemon en development
- Script: start:dev:watch con nodemon --exec npm run lint && ts-node src/main.ts
- Config: [nodemon.json](/nodemon.json)

### Validación de endpoints
- datos de entrada en body: ValidationPipe global + class-validator en [CreateOrderInput](/src/domain/order/controller/order.interface.ts#L5)
- invalidar datos extras no permitidos: whitelist: true, forbidNonWhitelisted: true en ValidationPipe
- Implementación ValidationPipe: [main.ts:21-25](/src/main.ts#L21-L25)
- query params: GetInstrumentsQueryDto con @Query() + class-validator (page, limit)
- Query DTO: [instrument-search.query.dto.ts](/src/domain/instrument/controller/instrument-search.query.dto.ts)
- path params: DeleteInstrumentParamDto con @Param() + class-validator (name)
- Path params en portfolio: [portfolio.controller.ts:13](/src/domain/portfolio/controller/portfolio.controller.ts#L13)

### Environments
- development, staging, production en .envs/
- Scripts: npm run start:dev, start:staging, start:prod (cross-env)
- Shell/Docker env vars sobrescriben .envs/ (dotenv no pisareadas si ya existen)
- Variables de entorno: [.envs/.development](/.envs/.development), [.envs/.staging](/.envs/.staging), [.envs/.production](/.envs/.production)

### Errors
- handler general: TraceExceptionFilter con APP_FILTER
- manejo de errores custom: HttpException personalizada en trace.filter.ts
- respuesta uniforme: trace ID incluido en error responses
- Exception filter: [trace.filter.ts](/src/tracer/trace.filter.ts)

### Logging
- LoggerMiddleware con trace ID en todos los logs
- x-trace-id: extraido/creado en TraceMiddleware via AsyncLocalStorage
- Implementación: [logger.middleware.ts](/src/logger/logger.middleware.ts)

### Testing
- coverage: jest con spec files junto al código
- Tests: order.service.spec.ts (crear órdenes)
- Test file: [order.service.spec.ts](/src/domain/order/service/order.service.spec.ts)

### Husky
- pre-commit hook: npm run lint && npm run typecheck && npm run test && npm run build
- Hook: [.husky/pre-commit](/.husky/pre-commit)

### Estándares
- eslint, prettier, no any, sin variables no usadas
- Configurado via eslintrc + tsconfig strict
- ESLint: [eslint.config.js](/eslint.config.js)
- TypeScript: [tsconfig.json](/tsconfig.json)

### Conexión a BD
- pool de conexiones: TypeOrmModule.forRootAsync con configuracion
- orm: @nestjs/typeorm + typeorm + pg
- migraciones: TypeORM CLI con typeorm-cli.config.ts
- dockercompose: PostgreSQL 16 container en docker-compose.yml
- TypeORM config: [app.module.ts:25-40](/src/app.module.ts#L25-L40)
- CLI config: [typeorm-cli.config.ts](/typeorm-cli.config.ts)

### Trace ID System
- middleware: TraceMiddleware en app.module.ts
- interceptor: TraceInterceptor con APP_INTERCEPTOR
- exception filter: TraceExceptionFilter con APP_FILTER
- logging: LoggerMiddleware con trace ID
- Middleware: [trace.middleware.ts](/src/tracer/trace.middleware.ts)
- Interceptor: [trace.interceptor.ts](/src/tracer/trace.interceptor.ts)
- Exception filter: [trace.filter.ts](/src/tracer/trace.filter.ts)
- Logger: [logger.middleware.ts](/src/logger/logger.middleware.ts)

### Segurización
- helmet: app.use(helmet()) en main.ts
- cors: app.use(cors()) en main.ts
- Helmet: [main.ts:15](/src/main.ts#L15)
- CORS: [main.ts:16](/src/main.ts#L16)

### Requerimientos

**REST API**
- 3 endpoints: GET /portfolio/:userId, GET /instrument/search, POST /order
- Controllers en InstrumentModule, OrderModule, PortfolioModule
- Controllers: [instrument-search.controller.ts](/src/domain/instrument/controller/instrument-search.controller.ts), [order.controller.ts](/src/domain/order/controller/order.controller.ts), [portfolio.controller.ts](/src/domain/portfolio/controller/portfolio.controller.ts)

**Índices pg_trgm**
- gin indexes en ticker y name para similarity search
- Migración: [1700000000003-AddPgTrgmIndexes.ts](/src/database/migrations/1700000000003-AddPgTrgmIndexes.ts)

**Búsqueda similarity**
- pg_trgm similarity() con scoring ponderado (0.7 ticker, 0.3 name)
- SQL queries: [instrument.repository.impl.ts:17-42](/src/domain/instrument/repository/instrument.repository.impl.ts#L17-L42)

**Invalidar cache**
- cache-service.ts: metodos invalidate(key) y invalidatePrefix(prefix)
- cached-decorator.ts: decorador @cached para cachear resultados
- Cache service: [cache-service.ts:41-58](/src/domain/shared/cache/cache-service.ts#L41-L58)
- Decorator: [cached-decorator.ts](/src/domain/shared/cache/cached-decorator.ts)

**Colección postman**
- Existe en: [docs/POSTMAN/nest-alive-api.postman_collection.json](/docs/POSTMAN/nest-alive-api.postman_collection.json)

---

## ❌ REJECTED

### Documentación (diagrama arquitectura)
- opcional, nunca implementado
