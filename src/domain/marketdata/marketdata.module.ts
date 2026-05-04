import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { MarketDataRepository } from './marketdata.repository';
import { MarketDataRepositoryImpl } from './marketdata.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([MarketData])],
  providers: [
    { provide: MarketDataRepository, useClass: MarketDataRepositoryImpl },
  ],
  exports: [MarketDataRepository],
})
export class MarketDataModule {}