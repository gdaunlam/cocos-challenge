export interface InstrumentStatus {
  debit: number;
  credit: number;
  holdings: number;
  limit: number;
}

export type InstrumentStatusMap = Map<number, InstrumentStatus>;

export function createEmptyInstrumentStatus(): InstrumentStatus {
  return {
    debit: 0,
    credit: 0,
    holdings: 0,
    limit: 0
  };
}
