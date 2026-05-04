import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { MarketPricesResolver } from '../shared/market-prices-resolver';
import { PortfolioStatusBuilder } from '../shared/portfolio-status-builder';
import { cacheService } from '../shared/cache';
import { Instrument } from '../../database/migrations/entities/instrument.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { Order } from '../../database/migrations/entities/order.entity';
import { CreateOrderInput, CreateOrderResult } from './order.interface';

@Injectable()
export class OrderService {
  private marketData: MarketData[] = [];
  private instruments: Instrument[] = [];

  constructor(private readonly orderRepository: OrderRepository) {}

  setMarketData(marketData: MarketData[]): void {
    this.marketData = marketData;
  }

  setInstruments(instruments: Instrument[]): void {
    this.instruments = instruments;
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    if (!input.instrumentId || input.instrumentId <= 0) {
      throw new Error('instrumentId must be a positive number');
    }
    if (!input.userId || input.userId <= 0) {
      throw new Error('userId must be a positive number');
    }

    const hasQuantity = input.quantity !== undefined && input.quantity !== null;
    const hasAmount = input.amount !== undefined && input.amount !== null;

    if (!hasQuantity && !hasAmount) {
      throw new Error('quantity or amount is required');
    }
    if (hasQuantity && hasAmount) {
      throw new Error('cannot specify both quantity and amount');
    }

    const isMarket = input.price === undefined || input.price === null;

    if (!isMarket && input.price! <= 0) {
      throw new Error('Price must be greater than 0');
    }

    const orders = await this.orderRepository.findAll();
    const effectivePrice = isMarket
      ? MarketPricesResolver.getMarketPrice(orders, this.marketData, input.instrumentId)
      : input.price!;

    const effectiveSize = hasQuantity
      ? input.quantity!
      : Math.floor(input.amount! / effectivePrice);

    if (effectiveSize <= 0) {
      throw new Error('Order size must be greater than 0');
    }

    const arsInstrument = this.instruments.find(i => i.type === 'MONEDA');
    if (!arsInstrument) {
      throw new Error('ARS instrument not found');
    }

    const userOrders = orders.filter(o => o.userId === input.userId);
    const processor = new PortfolioStatusBuilder(arsInstrument.id);
    processor.process(userOrders);

    const arsStatus = processor.getInstrumentStatus(arsInstrument.id);
    const targetStatus = processor.getInstrumentStatus(input.instrumentId);

    const totalCost = effectiveSize * effectivePrice;
    let status: Order['status'] = 'REJECTED';

    if (input.side === 'BUY' && arsStatus && totalCost <= arsStatus.credit) {
      status = isMarket ? 'FILLED' : 'NEW';
    }
    if (input.side === 'SELL' && targetStatus && effectiveSize <= targetStatus.limit) {
      status = isMarket ? 'FILLED' : 'NEW';
    }

    const newOrder: Order = {
      id: 0,
      instrumentId: input.instrumentId,
      userId: input.userId,
      side: input.side,
      size: effectiveSize,
      price: effectivePrice,
      type: isMarket ? 'MARKET' : 'LIMIT',
      status,
      datetime: new Date().toISOString()
    };

    const savedOrder = await this.orderRepository.save(newOrder);

    cacheService.invalidatePrefix('portfolio');

    return { order: savedOrder };
  }
}
