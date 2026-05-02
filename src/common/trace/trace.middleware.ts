import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TraceService } from './trace.service';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private readonly traceService: TraceService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = this.traceService.extractOrCreateTraceId(req.headers as Record<string, unknown>);
    this.traceService.runWithTraceId(traceId, () => {
      next();
    });
  }
}