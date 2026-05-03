import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument } from '../../database/migrations/entities/instrument.entity';

@Injectable()
export class InstrumentsRepository {
  constructor(@InjectRepository(Instrument) private readonly repository: Repository<Instrument>) {}

  async findAll(): Promise<Instrument[]> {
    return this.repository.find();
  }

  async findByName(name: string): Promise<Instrument | null> {
    return this.repository.findOne({ where: { name } });
  }

  async save(instrument: Instrument): Promise<Instrument> {
    return this.repository.save(instrument);
  }

  async delete(name: string): Promise<void> {
    await this.repository.delete({ name });
  }
}