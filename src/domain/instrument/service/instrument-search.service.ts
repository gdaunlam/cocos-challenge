import { Injectable } from '@nestjs/common';
import { InstrumentRepositoryImpl } from '../repository/instrument.repository.impl';
import { cached } from '../../shared/cache';
import { SearchInstrumentsOutput } from '../controller/instrument-search.interface';
import { SearchBy, SearchInstrumentsQueryDto } from '../controller/instrument-search.query.dto';


@Injectable()
export class InstrumentSearchService {
  constructor(private readonly repository: InstrumentRepositoryImpl) { }

  @cached('search', function (this: InstrumentSearchService, input: SearchInstrumentsQueryDto) {
    return `search:${input.q}:${input.type ?? 'all'}:${input.searchBy ?? SearchBy.BOTH}:${input.page}:${input.limit}`
  })
  async search(input: SearchInstrumentsQueryDto): Promise<SearchInstrumentsOutput> {
    const searchBy: SearchBy = input.searchBy ?? SearchBy.BOTH;
    const limit = input.limit;
    const offset = (input.page - 1) * input.limit;

    const searchResults = await this.repository.findWithSimilarity(
      input.q,
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

    const total = searchResults[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      results,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
      },
    };
  }
}
