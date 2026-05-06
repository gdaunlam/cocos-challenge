import { InstrumentType } from "../../../database/entities/instrument.entity";

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
