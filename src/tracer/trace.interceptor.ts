import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TraceService } from './trace.service';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  constructor(private readonly traceService: TraceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const existingTraceId = this.traceService.getTraceId();
    const traceId = existingTraceId !== 'no-trace' 
      ? existingTraceId 
      : this.traceService.extractOrCreateTraceId(request.headers);

    return new Observable(subscriber => {
      this.traceService.runWithTraceId(traceId, () => {
        const subscription = next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
        return () => subscription.unsubscribe();
      });
    });
  }
}