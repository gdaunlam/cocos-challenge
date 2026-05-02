import { Injectable, BadRequestException } from '@nestjs/common';
import { InstrumentsRepository } from './instruments.repository';
import { Instrument } from '../../interfaces/instrument.class';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async findAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.findAll();
  }

  async create(data: Omit<Instrument, 'name'> & { name: string }): Promise<Instrument[]> {
    const instruments = await this.instrumentsRepository.findAll();
    if (instruments.some((i) => i.name === data.name)) {
      throw new BadRequestException(`Instrument ${data.name} already exists`);
    }
    instruments.push(data);
    await this.instrumentsRepository.save(instruments);
    return instruments;
  }

  async delete(name: string): Promise<Instrument[]> {
    const instruments = await this.instrumentsRepository.findAll();
    const filtered = instruments.filter((i) => i.name !== name);
    await this.instrumentsRepository.save(filtered);
    return filtered;
  }
}