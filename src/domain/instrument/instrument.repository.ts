import { Instrument, InstrumentType } from '../../database/migrations/entities/instrument.entity';

export type { Instrument, InstrumentType };

export abstract class InstrumentRepository {
  abstract findAll(): Promise<Instrument[]>;
  abstract findByType(type: InstrumentType): Promise<Instrument[]>;
  abstract findById(id: number): Promise<Instrument | null>;
}
