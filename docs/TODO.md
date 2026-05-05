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
        Shell/Docker env vars sobrescriben .envs/ (dotenv no pisareadas si ya existen)
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
    requerimiento
        REST API
            3 endpoints: GET /portfolio/:userId, GET /instruments/search, POST /orders
            Controllers en InstrumentModule, OrderModule, PortfolioModule
        índices pg_trgm
            gin indexes en ticker y name para similarity search
        búsqueda similarity
            pg_trgm similarity() con scoring ponderado (0.7 ticker, 0.3 name)

## TODO
    requerimiento
        opcional
            colección postman
            documentación (diagrama arquitectura)