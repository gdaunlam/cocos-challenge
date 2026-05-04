import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketData } from '../../database/migrations/entities/marketdata.entity';
import { MarketDataRepository } from './marketdata.repository';

@Injectable()
export class MarketDataRepositoryImpl extends MarketDataRepository {
  constructor(@InjectRepository(MarketData) private readonly repository: Repository<MarketData>) {
    super();
  }

  async findAll(): Promise<MarketData[]> {
    return this.repository.find();
  }

  async findByInstrumentId(instrumentId: number): Promise<MarketData[]> {
    return this.repository.find({ where: { instrumentId } });
  }
}