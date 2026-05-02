import { Module } from '@nestjs/common';
import { InstrumentsModule } from './domain/instruments/instruments.module';

@Module({
  imports: [InstrumentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}