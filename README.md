DONE
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

TODO
    segurización
        jwt
        auth
        authorization
        authentication
        rate limit
        cors
        helmet
        csrf
        content security policy
    requerimiento
        aplicación
        casos de uso
        arquitectura
        no romper si no hace falta en los endpoints
        trabajar con arrays de ids para la persistencia
    documentación
        funcionamiento del sistema por topicos
        diagrama
        colección de postman
        actualizar swagger