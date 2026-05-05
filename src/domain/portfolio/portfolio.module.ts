import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/migrations/entities/order.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { PortfolioRepositoryImpl } from './repository/portfolio.repository.impl';
import { PortfolioService } from './service/portfolio.service';
import { PortfolioController } from './controller/portfolio.controller';
import { InstrumentModule } from '../instrument/instrument.module';
import { MarketDataModule } from '../marketdata/marketdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, MarketData, Instrument]),
    InstrumentModule,
    MarketDataModule,
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioRepositoryImpl,
    PortfolioService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
