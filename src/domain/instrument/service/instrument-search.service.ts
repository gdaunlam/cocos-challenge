import { Injectable } from '@nestjs/common';
import { InstrumentRepositoryImpl } from '../repository/instrument.repository.impl';
import { cached } from '../../shared/cache';
import { SearchInstrumentsInput, SearchInstrumentsOutput } from '../controller/instrument-search.interface';

type SearchBy = 'ticker' | 'name' | 'both';

@Injectable()
export class InstrumentSearchService {
  constructor(private readonly repository: InstrumentRepositoryImpl) {}

  @cached('search', (input: SearchInstrumentsInput) =>
    `search:${input.query}:${input.type ?? 'all'}:${input.searchBy ?? 'both'}:${input.page}:${input.limit}`
  )
  async search(input: SearchInstrumentsInput): Promise<SearchInstrumentsOutput> {
    this.validateInput(input);
    const searchBy: SearchBy = input.searchBy ?? 'both';
    const limit = input.limit;
    const offset = (input.page - 1) * input.limit;

    const searchResults = await this.repository.findWithSimilarity(
      input.query,
      searchBy,
      input.type,
      limit,
      offset,
    );

    const results = searchResults.map(r => ({
      id: r.instrument.id,
      ticker: r.instrument.ticker,
      name: r.instrument.name,
      type: r.instrument.type,
      score: r.score,
    }));

    const totalResults = await this.repository.findWithSimilarity(
      input.query,
      searchBy,
      input.type,
      10000,
      0,
    );
    const total = totalResults.length;
    const totalPages = Math.ceil(total / limit);

    return {
      results,
      pagination: {
        page: input.page,
        limit,
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
}
