import { Injectable, BadRequestException } from '@nestjs/common';
import { InstrumentsRepository } from './instruments.repository';
import { Instrument } from '../../database/migrations/entities/instrument.entity';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async findAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.findAll();
  }

  async create(data: Omit<Instrument, 'name'> & { name: string }): Promise<Instrument[]> {
    const existing = await this.instrumentsRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestException(`Instrument ${data.name} already exists`);
    }
    await this.instrumentsRepository.save(data as Instrument);
    return this.findAll();
  }

  async delete(name: string): Promise<Instrument[]> {
    await this.instrumentsRepository.delete(name);
    return this.findAll();
  }
}