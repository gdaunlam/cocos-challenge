# Nest Alive - Estándares de Desarrollo

Este documento define las convenciones y decisiones de arquitectura para asegurar consistencia en el proyecto.

---

## 1. Estructura de Carpetas

### Módulos por Dominio
```
src/domain/{entity}/
├── {entity}.module.ts
├── {entity}.service.ts
├── {entity}.repository.ts
└── controller/
    ├── {entity}.controller.ts
    └── request/
        └── create-{entity}.request.ts
```

**Por qué:** Mantiene todo relacionado a un dominio junto, pero separado de infraestructura.

### Interfaces de Negocio Separadas
```
src/interfaces/
└── {entity}.class.ts
```

**Por qué:** Las interfaces de negocio no pertenecen a ningún dominio específico y pueden ser compartidas.

---

## 2. DTOs y Validación

### Request DTOs junto al Controller
- Located at: `controller/request/`
- Usar `class-validator` decorators para validación
- Usar `@ApiProperty()` para documentación Swagger

**Ejemplo:**
```typescript
// controller/request/create-instrument.request.ts
export class CreateInstrumentRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;
  // ...
}
```

### Response/Entity Interfaces con Swagger
```typescript
// src/interfaces/instrument.class.ts
export class Instrument {
  @ApiProperty({ example: 'Bond A' })
  name!: string;
  // ...
}
```

**Por qué:** Swagger se genera automáticamente de los decorators, evitando duplicar documentación.

---

## 3. Middleware y Trace ID

### Registro de Middlewares en AppModule
Todos los middlewares se registran en `app.module.ts`, NO en módulos hijos.

```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
```

**Por qué:** Evita configuración oculta. Cuando alguien lee `app.module.ts` ve todos los middlewares activos.

### Trace ID Flow
1. **TraceMiddleware** → Extrae o crea el trace ID del header `x-trace-id`
2. **TraceInterceptor** → Solo wraps el handler, no re-crea trace ID
3. **TraceExceptionFilter** → Usa `getTraceId()` para logs y response

**Importante:** `next()` debe llamarse **dentro** del callback de `runWithTraceId`:
```typescript
this.traceService.runWithTraceId(traceId, () => {
  next(); // ← aquí dentro
});
```

---

## 4. Configuración

### Centralizada con @nestjs/config
Usar `registerAs` para configs tipadas:

```typescript
// config/configuration.ts
export const configuration = registerAs('environment', (): IEnvironmentConfig => {
  // ...
});
```

### Environments
Archivos en `.envs/` por entorno:
- `.envs/.development`
- `.envs/.staging`
- `.envs/.production`

Cargar en `app.module.ts`:
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: `.envs/.${process.env.NODE_ENV || 'development'}`,
  load: [configuration],
}),
```

---

## 5. Testing

### Archivos de Test
- **Unit tests**: `*.spec.ts` junto al archivo que prueban
- **E2E tests**: `*.e2e-spec.ts` en `src/`

### Cobertura mínima
- Servicios con lógica de negocio
- Middlewares e interceptors
- Filters de excepciones
- Configuration/validación de env vars

**No testear:**
- Controllers (mockean servicio automáticamente con `@nestjs/testing`)
- Código generados por decorators (Swagger, class-validator)

---

## 6. Reglas de Imports

| Tipo | Ubicación | Ejemplo |
|------|-----------|---------|
| Interfaces de negocio | `src/interfaces/` | `import { Instrument } from '../../interfaces/instrument.class'` |
| Request DTOs | `controller/request/` | `import { CreateInstrumentRequest } from './request/create-instrument.request'` |
| Services | `../{service}` | `import { InstrumentsService } from '../instruments.service'` |
| Repositories | `../{repository}` | `import { InstrumentsRepository } from '../instruments.repository'` |

---

## 7. Patterns a Evitar

### ❌ No hacer: Módulos auto-configurados
```typescript
// MAL - configure() en módulo hijo con @Global()
@Global()
@Module({ ... })
export class TraceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceMiddleware).forRoutes('*'); // Oculto!
  }
}
```

### ✅ Hacer: Registro explícito en AppModule
```typescript
// BIEN - Todo en app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
```

### ❌ No hacer: Lógica duplicada en interceptor
```typescript
// MAL - El interceptor no debe re-crear trace ID
const existingTraceId = this.traceService.getTraceId();
if (existingTraceId !== 'no-trace') {
  // usar existing...
}
```

### ✅ Hacer: Interceptor solo wrapping
```typescript
// BIEN - El middleware ya seteo el trace ID
const traceId = this.traceService.extractOrCreateTraceId(request.headers);
```

---

## 8. Checklist antes de Commit

- [ ] ¿Nuevo módulo en `src/domain/`?
- [ ] ¿Request DTO con `class-validator` y `@ApiProperty`?
- [ ] ¿Interface de negocio en `src/interfaces/` con `@ApiProperty`?
- [ ] ¿Middleware registrado en `app.module.ts`?
- [ ] ¿`next()` dentro de `runWithTraceId()`?
- [ ] ¿Tests para lógica nueva?
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` pasa?

---

## 9. Notas para Agentes

Al trabajar en este proyecto:
1. **Lee `STANDARDS.md` antes de hacer cambios**
2. **Revisa los changelogs en `CHANGELOG/`** para entender decisiones previas
3. **Si algo no está cubierto, pregúntame** antes de asumir

Para agregar nuevos estándares, crear PR con:
- Descripción del pattern
- Ejemplo de código
- Razón del cambio
