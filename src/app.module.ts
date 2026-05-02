import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { InstrumentsModule } from './domain/instruments/instruments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.envs/.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
    }),
    InstrumentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}