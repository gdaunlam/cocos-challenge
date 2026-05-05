import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument, InstrumentType } from '../../../database/entities/instrument.entity';

type SearchResult = { instrument: Instrument; score: number };
type SearchBy = 'ticker' | 'name' | 'both';

@Injectable()
export class InstrumentRepositoryImpl {
  constructor(@InjectRepository(Instrument) private readonly repository: Repository<Instrument>) {}

  async findAll(): Promise<Instrument[]> {
    return this.repository.find();
  }

  private readonly QUERIES = {
    ticker: `
      SELECT i.*, similarity(i.ticker, $1) AS score
      FROM instruments i
      WHERE ($2::text IS NULL OR i.type = $2)
        AND (similarity(i.ticker, $1) > 0)
      ORDER BY score DESC
      LIMIT $3 OFFSET $4
    `,
    name: `
      SELECT i.*, similarity(i.name, $1) AS score
      FROM instruments i
      WHERE ($2::text IS NULL OR i.type = $2)
        AND (similarity(i.name, $1) > 0)
      ORDER BY score DESC
      LIMIT $3 OFFSET $4
    `,
    both: `
      SELECT i.*, GREATEST(similarity(i.ticker, $1) * 0.7, similarity(i.name, $1) * 0.3) AS score
      FROM instruments i
      WHERE ($2::text IS NULL OR i.type = $2)
        AND (similarity(i.ticker, $1) > 0 OR similarity(i.name, $1) > 0)
      ORDER BY score DESC
      LIMIT $3 OFFSET $4
    `,
  } as const;

  async findWithSimilarity(
    query: string,
    searchBy: SearchBy,
    type?: InstrumentType,
    limit = 10,
    offset = 0,
  ): Promise<SearchResult[]> {
    const sql = this.QUERIES[searchBy];
    const params: (string | number | null)[] = [query, type ?? null, limit, offset];

    const results = await this.repository.query(sql, params);

    return results.map((row: any) => ({
      instrument: {
        id: row.id,
        ticker: row.ticker,
        name: row.name,
        type: row.type,
      } as Instrument,
      score: parseFloat(row.score),
    }));
  }
}
