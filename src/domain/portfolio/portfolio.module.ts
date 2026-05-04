import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/migrations/entities/order.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { PortfolioRepository } from './portfolio.repository';
import { PortfolioRepositoryImpl } from './portfolio.repository.impl';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketData, Instrument])],
  providers: [
    { provide: PortfolioRepository, useClass: PortfolioRepositoryImpl },
    PortfolioService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
