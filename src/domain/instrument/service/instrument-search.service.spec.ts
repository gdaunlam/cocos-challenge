const data = require('../../../../data/data.json');
import { InstrumentSearchService } from './instrument-search.service';
import { InstrumentRepositoryImpl } from '../repository/instrument.repository.impl';
import { Instrument, InstrumentType } from '../../../database/entities/instrument.entity';

const instruments = data.instruments as Instrument[];

type SearchResult = { instrument: Instrument; score: number };

const createMockRepository = (overrides?: Partial<InstrumentRepositoryImpl>): InstrumentRepositoryImpl => ({
  findAll: jest.fn().mockResolvedValue(instruments),
  findWithSimilarity: jest.fn().mockImplementation((query: string, searchBy: 'ticker' | 'name' | 'both', type?: InstrumentType, limit = 10, offset = 0) => {
    const q = query.toLowerCase();
    const scored = instruments
      .filter(i => !type || i.type === type)
      .map(i => {
        let score = 0;
        if (searchBy === 'ticker' || searchBy === 'both') {
          if (i.ticker.toLowerCase() === q) score = 1;
          else if (i.ticker.toLowerCase().startsWith(q)) score = 0.9;
          else if (i.ticker.toLowerCase().includes(q)) score = 0.6;
        }
        if (searchBy === 'name' || searchBy === 'both') {
          if (i.name.toLowerCase() === q) score = Math.max(score, 1);
          else if (i.name.toLowerCase().startsWith(q)) score = Math.max(score, 0.9);
          else if (i.name.toLowerCase().includes(q)) score = Math.max(score, 0.6);
        }
        return { instrument: i, score };
      })
      .filter((r: SearchResult) => r.score > 0)
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
      .slice(offset, offset + limit);
    return Promise.resolve(scored);
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
    const result = await service.search({ query: 'gal', page: 1, limit: 10 });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });

  it('should order results by score descending', async () => {
    const result = await service.search({ query: 'banco', page: 1, limit: 10 });

    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i - 1].score).toBeGreaterThanOrEqual(result.results[i].score);
    }
  });

  it('should filter by type when provided', async () => {
    const result = await service.search({ query: 'arg', page: 1, limit: 10, type: InstrumentType.MONEDA });

    for (const r of result.results) {
      expect(r.type).toBe(InstrumentType.MONEDA);
    }
  });

  it('should paginate results correctly', async () => {
    const result = await service.search({ query: 'arg', page: 1, limit: 2 });

    expect(result.results.length).toBe(2);
    expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should throw error for query shorter than 3 characters', async () => {
    await expect(service.search({ query: 'ab', page: 1, limit: 10 }))
      .rejects.toThrow('query must be at least 3 characters');
  });

  it('should throw error for page <= 0', async () => {
    await expect(service.search({ query: 'abc', page: 0, limit: 10 }))
      .rejects.toThrow('page must be a positive number');
  });

  it('should throw error for limit <= 0', async () => {
    await expect(service.search({ query: 'abc', page: 1, limit: 0 }))
      .rejects.toThrow('limit must be a positive number');
  });

  it('should search by ticker only when searchBy=ticker', async () => {
    const result = await service.search({ query: 'ggal', page: 1, limit: 10, searchBy: 'ticker' });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.ticker.toLowerCase()).toContain('ggal');
  });

  it('should search by name only when searchBy=name', async () => {
    const result = await service.search({ query: 'galicia', page: 1, limit: 10, searchBy: 'name' });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.name.toLowerCase()).toContain('galicia');
  });

  it('should use weighted scoring for searchBy=both (default)', async () => {
    const result = await service.search({ query: 'ggal', page: 1, limit: 10 });

    expect(result.results.length).toBeGreaterThan(0);
    const topResult = result.results[0];
    expect(topResult.ticker).toBe('GGAL');
  });
});
