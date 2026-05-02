import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from '@nestjs/common/services/logger.service';
import { TraceService } from './trace.service';

@Injectable()
export class TraceLogger implements LoggerService {
  private readonly logger = new Logger(TraceLogger.name);

  constructor(private readonly traceService: TraceService) {}

  log(message: string, context?: string): void {
    this.logger.log(`[${this.traceService.getTraceId()}] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(`[${this.traceService.getTraceId()}] ${message}`, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(`[${this.traceService.getTraceId()}] ${message}`, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(`[${this.traceService.getTraceId()}] ${message}`, context);
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(`[${this.traceService.getTraceId()}] ${message}`, context);
  }
}