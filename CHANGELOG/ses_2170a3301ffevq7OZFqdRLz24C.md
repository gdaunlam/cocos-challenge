# Session: ses_2170a3301ffevq7OZFqdRLz24C

**Date:** 2026-05-02T12:58:36.158Z
**Title:** Agregar Swagger al proyecto

## Summary

Se integró Swagger (OpenAPI) al proyecto NestJS y se reorganizó la estructura de interfaces.

## Key Changes

1. **Swagger Integration**
   - Installed `@nestjs/swagger` package
   - Configured Swagger in `src/main.ts` with DocumentBuilder
   - Swagger UI available at `/api` route
   - **Updated**: Swagger now only enabled when `ENABLE_SWAGGER=true` env var is set

2. **API Documentation Decorators**
   - Added `@ApiProperty()` decorators to `CreateInstrumentRequest` DTO properties
   - Resolved TypeScript strict initialization errors using definite assignment assertion (`!`)

3. **Interface Reorganization**
   - Moved `src/domain/instruments/instrument.interface.ts` to `src/interfaces/`
   - Updated imports in all dependent files