import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { MarketData } from '../../database/entities/marketdata.entity';
import { Instrument } from '../../database/entities/instrument.entity';
import { OrderRepositoryImpl } from './repository/order.repository.impl';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';
import { InstrumentModule } from '../instrument/instrument.module';
import { MarketDataModule } from '../marketdata/marketdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, MarketData, Instrument]),
    InstrumentModule,
    MarketDataModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderRepositoryImpl,
    OrderService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
