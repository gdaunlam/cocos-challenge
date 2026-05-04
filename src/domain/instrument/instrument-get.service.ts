import { Injectable } from '@nestjs/common';
import { InstrumentRepository } from './instrument.repository';
import { Instrument, InstrumentType } from '../../database/migrations/entities/instrument.entity';

@Injectable()
export class InstrumentGetService {
  constructor(private readonly repository: InstrumentRepository) {}

  async findAll(): Promise<Instrument[]> {
    return this.repository.findAll();
  }

  async findByType(type?: InstrumentType): Promise<Instrument[]> {
    if (type) {
      return this.repository.findByType(type);
    }
    return this.repository.findAll();
  }

  async getFirstByType(type: InstrumentType): Promise<Instrument | null> {
    const instruments = await this.repository.findByType(type);
    return instruments[0] || null;
  }
}
