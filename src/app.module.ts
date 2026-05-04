import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { configuration } from './config/configuration';
import { InstrumentModule } from './domain/instrument/instrument.module';
import { TraceInterceptor } from './tracer/trace.interceptor';
import { TraceExceptionFilter } from './tracer/trace.filter';
import { TraceMiddleware } from './tracer/trace.middleware';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TraceService } from './tracer/trace.service';
import { databaseConfiguration } from './database/configuration';
import { IDatabaseConfig } from './database/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.envs/.${process.env.NODE_ENV || 'development'}`,
      load: [configuration, databaseConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<IDatabaseConfig>('database')!;
        return {
          type: 'postgres',
          host: dbConfig.dbHost,
          port: dbConfig.dbPort,
          username: dbConfig.dbUsername,
          password: dbConfig.dbPassword,
          database: dbConfig.dbDatabase,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    InstrumentModule,
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