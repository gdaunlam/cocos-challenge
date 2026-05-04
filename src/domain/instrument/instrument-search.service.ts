import { Injectable } from '@nestjs/common';
import { InstrumentRepository } from './instrument.repository';
import { Instrument, InstrumentType } from '../../database/migrations/entities/instrument.entity';
import { cached } from '../shared/cache';
import {
  SearchInstrumentsInput,
  SearchInstrumentsOutput,
  SearchInstrumentsResult,
  SearchBy
} from '../../interfaces/instrument-search.class';

@Injectable()
export class InstrumentSearchService {
  constructor(private readonly repository: InstrumentRepository) {}

  @cached('search', (input: SearchInstrumentsInput) =>
    `search:${input.query}:${input.type ?? 'all'}:${input.searchBy ?? 'both'}:${input.page}:${input.limit}`
  )
  async search(input: SearchInstrumentsInput): Promise<SearchInstrumentsOutput> {
    this.validateInput(input);
    const searchBy = input.searchBy ?? 'both';

    const instruments = await this.repository.findAll();
    const filtered = this.filterByType(instruments, input.type);

    const scored = this.scoreInstruments(filtered, input.query, searchBy);
    const sorted = this.sortByScore(scored);

    const total = sorted.length;
    const totalPages = Math.ceil(total / input.limit);
    const offset = (input.page - 1) * input.limit;
    const paginated = sorted.slice(offset, offset + input.limit);

    return {
      results: paginated,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
      },
    };
  }

  private validateInput(input: SearchInstrumentsInput): void {
    if (!input.query || input.query.length < 3) {
      throw new Error('query must be at least 3 characters');
    }
    if (input.page <= 0) {
      throw new Error('page must be a positive number');
    }
    if (input.limit <= 0) {
      throw new Error('limit must be a positive number');
    }
  }

  private filterByType(instruments: Instrument[], type?: InstrumentType): Instrument[] {
    if (!type) return instruments;
    return instruments.filter(i => i.type === type);
  }

  private scoreInstruments(instruments: Instrument[], query: string, searchBy: SearchBy): SearchInstrumentsResult[] {
    const q = query.toLowerCase();
    return instruments.map(inst => ({
      id: inst.id,
      ticker: inst.ticker,
      name: inst.name,
      type: inst.type,
      score: this.calculateScore(inst, q, searchBy),
    }));
  }

  private calculateScore(inst: Instrument, query: string, searchBy: SearchBy): number {
    const ticker = inst.ticker.toLowerCase();
    const name = inst.name.toLowerCase();

    if (searchBy === 'ticker') {
      return this.calculateFieldScore(ticker, query, 1.0);
    }
    if (searchBy === 'name') {
      return this.calculateFieldScore(name, query, 1.0);
    }
    const tickerScore = this.calculateFieldScore(ticker, query, 0.7);
    const nameScore = this.calculateFieldScore(name, query, 0.3);
    return Math.max(tickerScore, nameScore);
  }

  private calculateFieldScore(field: string, query: string, weight: number): number {
    if (field === query) return weight;
    if (field.startsWith(query)) return weight * 0.9;
    if (field.includes(query)) return weight * 0.6;
    return 0;
  }

  private sortByScore(results: SearchInstrumentsResult[]): SearchInstrumentsResult[] {
    return results.sort((a, b) => b.score - a.score);
  }
}
