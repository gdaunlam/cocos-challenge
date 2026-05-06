const data = require('../../../../data/data.json');
import { InstrumentSearchService } from './instrument-search.service';
import { InstrumentRepositoryImpl } from '../repository/instrument.repository.impl';
import { Instrument, InstrumentType } from '../../../database/entities/instrument.entity';
import { SearchBy } from '../controller/instrument-search.query.dto';

const instruments = data.instruments as Instrument[];

type SearchResult = { instrument: Instrument; score: number; total: number };

const createMockRepository = (overrides?: Partial<InstrumentRepositoryImpl>): InstrumentRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(instruments),
  findWithSimilarity: jest.fn().mockImplementation((q: string, searchBy: SearchBy, type?: InstrumentType, limit = 10, offset = 0) => {
    const qLower = q.toLowerCase();
    const scored = instruments
      .filter(i => !type || i.type === type)
      .map(i => {
        let score = 0;
        if (searchBy === SearchBy.TICKER || searchBy === SearchBy.BOTH) {
          if (i.ticker.toLowerCase() === qLower) score = 1;
          else if (i.ticker.toLowerCase().startsWith(qLower)) score = 0.9;
          else if (i.ticker.toLowerCase().includes(qLower)) score = 0.6;
        }
        if (searchBy === SearchBy.NAME || searchBy === SearchBy.BOTH) {
          if (i.name.toLowerCase() === qLower) score = Math.max(score, 1);
          else if (i.name.toLowerCase().startsWith(qLower)) score = Math.max(score, 0.9);
          else if (i.name.toLowerCase().includes(qLower)) score = Math.max(score, 0.6);
        }
        return { instrument: i, score, total: 0 };
      })
      .filter((r: SearchResult) => r.score > 0)
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score);
    const total = scored.length;
    const paginated = scored.slice(offset, offset + limit).map(r => ({ ...r, total }));
    return Promise.resolve(paginated);
  }),
  ...overrides,
} as unknown as InstrumentRepositoryImpl);

describe('InstrumentSearchService', () => {
  let service: InstrumentSearchService;
  let mockRepository: InstrumentRepositoryImpl;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new InstrumentSearchService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return results for valid query', async () => {
    const result = await service.search({ q: 'gal', page: 1, limit: 10 });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });

  it('should order results by score descending', async () => {
    const result = await service.search({ q: 'banco', page: 1, limit: 10 });

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i - 1].score).toBeGreaterThanOrEqual(result.results[i].score);
    }
  });

  it('should filter by type when provided', async () => {
    const result = await service.search({ q: 'arg', page: 1, limit: 10, type: InstrumentType.MONEDA });

    for (const r of result.results) {
      expect(r.type).toBe(InstrumentType.MONEDA);
    }
  });

  it('should paginate results correctly', async () => {
    const result = await service.search({ q: 'arg', page: 1, limit: 2 });

    expect(result.results.length).toBe(2);
    expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should search by ticker only when searchBy=ticker', async () => {
    const result = await service.search({ q: 'ggal', page: 1, limit: 10, searchBy: SearchBy.TICKER });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.ticker.toLowerCase()).toContain('ggal');
  });

  it('should search by name only when searchBy=name', async () => {
    const result = await service.search({ q: 'galicia', page: 1, limit: 10, searchBy: SearchBy.NAME });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.name.toLowerCase()).toContain('galicia');
  });

  it('should use weighted scoring for searchBy=both (default)', async () => {
    const result = await service.search({ q: 'ggal', page: 1, limit: 10 });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.ticker).toBe('GGAL');
  });
});
