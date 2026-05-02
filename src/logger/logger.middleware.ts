import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TraceService } from '../tracer/trace.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  constructor(private readonly traceService: TraceService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, url, headers } = req;
    const traceId = this.traceService.getTraceId();
    const userAgent = headers['user-agent'] || '-';

    this.logger.log(
      `[${traceId}] ${method} ${url} - ${userAgent}`,
    );

    next();
  }
}