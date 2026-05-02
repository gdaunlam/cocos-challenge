---
session_id: nest-alive-trace-id-2026-05-02
date: 2026-05-02T14:38:00.000Z
title: Implement trace ID system
---

## Summary
Added trace ID system for request tracking across logs, errors, and future database queries. Uses AsyncLocalStorage for request-scoped storage and UUID v4 for ID generation.

## Key Changes
| File | Change |
|------|--------|
| src/tracer/trace.service.ts | Created TraceService with AsyncLocalStorage |
| src/tracer/trace.interceptor.ts | Created TraceInterceptor to extract/generate trace ID |
| src/tracer/trace.filter.ts | Created TraceExceptionFilter to include trace ID in errors |
| src/tracer/trace.logger.ts | Created TraceLogger with trace ID in all log levels |
| src/tracer/trace.middleware.ts | Created TraceMiddleware (not currently used) |
| src/tracer/trace.module.ts | Created global TraceModule |
| src/app.module.ts | Imported TraceModule, registered interceptor and filter globally |
| src/main.ts | Fixed ConfigService usage for IEnvironmentConfig |
| package.json | Added uuid and @types/express dependencies |

## Technical Details
- **Header**: `x-trace-id` (uses UUID v4 if not provided)
- **Storage**: AsyncLocalStorage for request-scoped access
- **Coverage**: Logs (all levels), exception filter, response header