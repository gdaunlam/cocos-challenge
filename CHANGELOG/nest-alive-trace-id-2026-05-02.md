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
| src/common/trace/trace.service.ts | Created TraceService with AsyncLocalStorage |
| src/common/trace/trace.interceptor.ts | Created TraceInterceptor to extract/generate trace ID |
| src/common/trace/trace.filter.ts | Created TraceExceptionFilter to include trace ID in errors |
| src/common/trace/trace.logger.ts | Created TraceLogger with trace ID in all log levels |
| src/common/trace/trace.middleware.ts | Created TraceMiddleware (not currently used) |
| src/common/trace/trace.module.ts | Created global TraceModule |
| src/app.module.ts | Imported TraceModule, registered interceptor and filter globally |
| src/main.ts | Fixed ConfigService usage for IEnvironmentConfig |
| package.json | Added uuid and @types/express dependencies |

## Technical Details
- **Header**: `X-Trace-ID` (uses UUID v4 if not provided)
- **Storage**: AsyncLocalStorage for request-scoped access
- **Coverage**: Logs (all levels), exception filter, response header