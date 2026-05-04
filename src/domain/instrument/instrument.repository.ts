import { Instrument, InstrumentType } from '../../database/migrations/entities/instrument.entity';

export type { Instrument, InstrumentType };

export type SearchBy = 'ticker' | 'name' | 'both';

export interface SearchResult {
  instrument: Instrument;
  score: number;
}

export abstract class InstrumentRepository {
  abstract findAll(): Promise<Instrument[]>;
  abstract findByType(type: InstrumentType): Promise<Instrument[]>;
  abstract findById(id: number): Promise<Instrument | null>;
  abstract findWithSimilarity(
    query: string,
    searchBy: SearchBy,
    type?: InstrumentType,
    limit?: number,
    offset?: number,
  ): Promise<SearchResult[]>;
}
