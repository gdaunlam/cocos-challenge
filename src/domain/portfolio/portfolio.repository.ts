import { Order } from '../../database/migrations/entities/order.entity';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { Instrument } from '../../database/migrations/entities/instrument.entity';

export abstract class PortfolioRepository {
  abstract findOrdersByUserId(userId: number): Promise<Order[]>;
  abstract findAllOrders(): Promise<Order[]>;
  abstract findAllMarketData(): Promise<MarketData[]>;
  abstract findAllInstruments(): Promise<Instrument[]>;
}
