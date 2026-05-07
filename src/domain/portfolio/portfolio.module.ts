import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { MarketData } from '../../database/entities/marketdata.entity';
import { Instrument } from '../../database/entities/instrument.entity';
import { PortfolioRepositoryImpl } from './repository/portfolio.repository.impl';
import { PortfolioService } from './service/portfolio.service';
import { PortfolioController } from './controller/portfolio.controller';
import { InstrumentModule } from '../instrument/instrument.module';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { User } from '../../database/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, MarketData, Instrument, User]),
    InstrumentModule,
    MarketDataModule,
    UserModule,
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioRepositoryImpl,
    PortfolioService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
