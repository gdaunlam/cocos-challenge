# Nest Alive - Estándares de Desarrollo

Este documento define las convenciones y decisiones de arquitectura para asegurar consistencia en el proyecto.

---

## 1. Estructura de Carpetas

### Módulos por Dominio
```
src/domain/{entity}/
├── {entity}.module.ts
├── controller/
│   ├── {entity}.controller.ts
│   └── {entity}.interface.ts
├── repository/
│   ├── {entity}.repository.interface.ts
│   └── {entity}.repository.impl.ts
└── service/
    └── {entity}.service.ts
```

**Por qué:** Separa claramente las responsabilidades de controller, repository y service. La interfaz de negocio vive junto al controller ya que define el contrato de la API.

### Interfaces de Negocio
```
src/domain/{entity}/controller/
└── {entity}.interface.ts
```

**Por qué:** Las interfaces de negocio están junto al controller ya que definen el contrato de la API del dominio.

### Estructura TypeORM (centralizada)
Cuando se usa TypeORM, centralizar todo lo relacionado en `src/database/`:
```
src/database/
├── configuration.ts        # registerAs('database', ...)
├── environment.ts          # IDatabaseConfig interface
└── migrations/
    ├── entities/
    │   └── {entity}.entity.ts
    └── {timestamp}-Create{Entity}Table.ts
```

**Por qué:** Mantiene entidades, migraciones y configuración de base de datos en un solo lugar, evitando distribución entre módulos de dominio y configuración.

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
  load: [configuration, databaseConfiguration],
}),
```

### Configuración TypeORM CLI
Archivo `typeorm-cli.config.ts` en raíz del proyecto para comandos de migraciones:
```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: `.envs/.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'nest_alive',
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
});
```

Scripts en `package.json`:
```json
{
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d typeorm-cli.config.ts",
  "migration:run": "npm run typeorm migration:run",
  "migration:revert": "npm run typeorm migration:revert",
  "migration:generate": "npm run typeorm migration:generate"
}
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
| Entities (TypeORM) | `src/database/migrations/entities/` | `import { Instrument } from '../../database/migrations/entities/instrument.entity'` |
| Business interfaces | `src/domain/{entity}/controller/` | `import { IInstrument } from '../../instrument/controller/instrument.interface'` |
| Request DTOs | `src/domain/{entity}/controller/request/` | `import { CreateInstrumentRequest } from './request/create-instrument.request'` |
| Services | `../service/{service}` | `import { InstrumentGetService } from '../service/instrument-get.service'` |
| Repositories | `../repository/{repository}` | `import { InstrumentRepository } from '../repository/instrument.repository.interface'` |

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

### ❌ No hacer: Ampliar área de afectación en cambios de infraestructura
Cuando el requerimiento pide cambiar solo la herramienta de conexión o datasource (ej: de JSON a PostgreSQL), evitar modificar lógica de negocio existente.

**Usar SOLID como guía:**
- **S**ingle Responsibility: La capa Repository es responsable de acceder a datos; el Service de la lógica de negocio
- **O**pen/Closed: Extender comportamiento agregando módulos, no modificando los existentes
- **L**iskov Substitution: El Repository debe cumplir el contrato de la interfaz que expone
- **I**nterface Segregation: Si el Service necesita `findAll()`, el Repository debe proveérlo
- **D**ependency Inversion: El Service depende de abstracciones (interfaz del Repository), no de implementaciones concretas

**Preguntar siempre:**
Antes de modificar el Service, consultar si el cambio es necesario o si solo se debe adaptar la capa Repository.

**MAL:** Modificar `findAll()` o `create()` en Service por mera conveniencia de implementación, ampliando el área de afectación
**BIEN:** Adaptar solo el Repository para que exponga los métodos que el Service necesita, manteniendo la lógica existente intacta

**Por qué:** Un cambio debe tener el menor impacto posible. Modificar lógica de negocio introduce riesgo de regresión y efectos colaterales que no estaban en el alcance del requerimiento.

---

## 8. Checklist antes de Commit

- [ ] ¿Nuevo módulo en `src/domain/`?
- [ ] ¿Request DTO con `class-validator` y `@ApiProperty`?
- [ ] ¿Entity TypeORM en `src/database/migrations/entities/` con `@ApiProperty`?
- [ ] ¿Migración en `src/database/migrations/`?
- [ ] ¿Middleware registrado en `app.module.ts`?
- [ ] ¿`next()` dentro de `runWithTraceId()`?
- [ ] ¿Tests para lógica nueva?
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` pasa?

---

## 9. Notas para Agentes

Al trabajar en este proyecto:
1. **Lee `STANDARDS.md` antes de hacer cambios**
2. **Revisa los changelogs en `CHANGELOG/`** para entender decisiones previas
3. **Si algo no está cubierto, pregúntame antes de asumir**
4. **Si un cambio implica lógica de negocio o amplía el área de afectación, pregúntame antes de implementarlo**

Para agregar nuevos estándares, crear PR con:
- Descripción del pattern
- Ejemplo de código
- Razón del cambio
