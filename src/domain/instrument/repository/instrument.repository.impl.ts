import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument, InstrumentType } from '../../../database/migrations/entities/instrument.entity';

type SearchResult = { instrument: Instrument; score: number };
type SearchBy = 'ticker' | 'name' | 'both';

@Injectable()
export class InstrumentRepositoryImpl {
  constructor(@InjectRepository(Instrument) private readonly repository: Repository<Instrument>) {}

  async findAll(): Promise<Instrument[]> {
    return this.repository.find();
  }

  async findByType(type: InstrumentType): Promise<Instrument[]> {
    return this.repository.find({ where: { type } });
  }

  async findById(id: number): Promise<Instrument | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findWithSimilarity(
    query: string,
    searchBy: SearchBy,
    type?: InstrumentType,
    limit = 10,
    offset = 0,
  ): Promise<SearchResult[]> {
    let scoreExpression: string;
    if (searchBy === 'ticker') {
      scoreExpression = 'similarity(i.ticker, $1)';
    } else if (searchBy === 'name') {
      scoreExpression = 'similarity(i.name, $1)';
    } else {
      scoreExpression = 'GREATEST(similarity(i.ticker, $1) * 0.7, similarity(i.name, $1) * 0.3)';
    }

    const havingClause = searchBy === 'ticker'
      ? 'similarity(i.ticker, $1) > 0'
      : searchBy === 'name'
        ? 'similarity(i.name, $1) > 0'
        : '(similarity(i.ticker, $1) > 0 OR similarity(i.name, $1) > 0)';

    const sql = `
      SELECT i.*, ${scoreExpression} AS score
      FROM instruments i
      WHERE ($${type ? '$2' : 'NULL'}::text IS NULL OR i.type = $${type ? '$2' : '$2'})
        AND (${havingClause})
      ORDER BY score DESC
      LIMIT $${type ? '$3' : '$2'} OFFSET $${type ? '$4' : '$3'}
    `;

    const params: (string | number | undefined)[] = [query];
    if (type) params.push(type);
    params.push(limit);
    params.push(offset);

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
