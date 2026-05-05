import { InstrumentType } from "../../../database/migrations/entities/instrument.entity";

export type SearchBy = 'ticker' | 'name' | 'both';

export interface SearchInstrumentsInput {
  query: string;
  type?: InstrumentType;
  searchBy?: SearchBy;
  page: number;
  limit: number;
}

export interface SearchInstrumentsResult {
  id: number;
  ticker: string;
  name: string;
  type: InstrumentType;
  score: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchInstrumentsOutput {
  results: SearchInstrumentsResult[];
  pagination: Pagination;
}
