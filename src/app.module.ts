import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { configuration } from './config/configuration';
import { InstrumentsModule } from './domain/instruments/instruments.module';
import { TraceInterceptor } from './tracer/trace.interceptor';
import { TraceExceptionFilter } from './tracer/trace.filter';
import { TraceMiddleware } from './tracer/trace.middleware';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TraceService } from './tracer/trace.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.envs/.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
    }),
    InstrumentsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: TraceExceptionFilter,
    },
    TraceService
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}