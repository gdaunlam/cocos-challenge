import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/migrations/entities/order.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { OrderRepository } from './order.repository';
import { OrderRepositoryImpl } from './order.repository.impl';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketData, Instrument])],
  providers: [
    { provide: OrderRepository, useClass: OrderRepositoryImpl },
    OrderService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
