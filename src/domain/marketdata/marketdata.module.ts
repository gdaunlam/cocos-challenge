import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { MarketDataRepositoryImpl } from './repository/marketdata.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([MarketData])],
  providers: [
    MarketDataRepositoryImpl,
  ],
  exports: [MarketDataRepositoryImpl],
})
export class MarketDataModule {}