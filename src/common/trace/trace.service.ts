import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface TraceContext {
  traceId: string;
}

@Injectable()
export class TraceService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

  getTraceId(): string {
    const store = this.asyncLocalStorage.getStore();
    return store?.traceId ?? 'no-trace';
  }

  extractOrCreateTraceId(headers: Record<string, unknown>): string {
    return (headers['x-trace-id'] as string) || uuidv4();
  }

  runWithTraceId<T>(traceId: string, callback: () => T): T {
    return this.asyncLocalStorage.run({ traceId }, callback);
  }
}