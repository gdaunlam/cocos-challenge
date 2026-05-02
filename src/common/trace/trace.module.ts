import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TraceService } from './trace.service';
import { TraceMiddleware } from './trace.middleware';
import { LoggerMiddleware } from './logger.middleware';

@Global()
@Module({
  providers: [TraceService, TraceMiddleware, LoggerMiddleware],
  exports: [TraceService],
})
export class TraceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceMiddleware, LoggerMiddleware).forRoutes('*');
  }
}