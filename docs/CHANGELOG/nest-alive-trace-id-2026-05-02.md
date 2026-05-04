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

## Updates (2026-05-02T19:00:00.000Z)
| File | Change |
|------|--------|
| src/app.module.ts | Added NestModule implementation with TraceMiddleware registered for all routes |
| src/tracer/trace.middleware.ts | Fixed next() call inside runWithTraceId callback |

## Updates (2026-05-02T19:30:00.000Z)
| File | Change |
|------|--------|
| src/logger/trace.logger.ts | Deleted - not used anywhere |
| src/tracer/trace.interceptor.ts | Simplified - removed redundant trace ID fallback logic |
