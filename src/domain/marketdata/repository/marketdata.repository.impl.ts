import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketData } from '../../../database/migrations/entities/marketdata.entity';

@Injectable()
export class MarketDataRepositoryImpl {
  constructor(@InjectRepository(MarketData) private readonly repository: Repository<MarketData>) {}

  async findAll(): Promise<MarketData[]> {
    return this.repository.find();
  }

  async findByInstrumentId(instrumentId: number): Promise<MarketData[]> {
    return this.repository.find({ where: { instrumentId } });
  }
}