import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument, InstrumentType } from '../../database/migrations/entities/instrument.entity';
import { InstrumentRepository } from './instrument.repository';

@Injectable()
export class InstrumentRepositoryImpl extends InstrumentRepository {
  constructor(@InjectRepository(Instrument) private readonly repository: Repository<Instrument>) {
    super();
  }

  async findAll(): Promise<Instrument[]> {
    return this.repository.find();
  }

  async findByType(type: InstrumentType): Promise<Instrument[]> {
    return this.repository.find({ where: { type } });
  }

  async findById(id: number): Promise<Instrument | null> {
    return this.repository.findOne({ where: { id } });
  }
}
