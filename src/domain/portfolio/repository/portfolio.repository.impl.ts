import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../database/migrations/entities/order.entity';
import { MarketData } from '../../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../../database/migrations/entities/instrument.entity';

@Injectable()
export class PortfolioRepositoryImpl {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(MarketData) private readonly marketDataRepository: Repository<MarketData>,
    @InjectRepository(Instrument) private readonly instrumentRepository: Repository<Instrument>
  ) {}

  async findOrdersByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId } });
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findAllMarketData(): Promise<MarketData[]> {
    return this.marketDataRepository.find();
  }

  async findAllInstruments(): Promise<Instrument[]> {
    return this.instrumentRepository.find();
  }
}
