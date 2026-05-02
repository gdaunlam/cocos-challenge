import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { configuration } from './config/configuration';
import { InstrumentsModule } from './domain/instruments/instruments.module';
import { TraceModule } from './common/trace/trace.module';
import { TraceInterceptor } from './common/trace/trace.interceptor';
import { TraceExceptionFilter } from './common/trace/trace.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.envs/.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
    }),
    TraceModule,
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
  ],
})
export class AppModule {}