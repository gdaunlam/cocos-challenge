import { MarketData } from '../../database/migrations/entities/marketdata.entity';

export abstract class MarketDataRepository {
  abstract findAll(): Promise<MarketData[]>;
  abstract findByInstrumentId(instrumentId: number): Promise<MarketData[]>;
}