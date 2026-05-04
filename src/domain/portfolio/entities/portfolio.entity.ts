export interface Position {
  ticker: string;
  name: string;
  quantity: number;
  marketValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
}

export interface PortfolioBody {
  totalValue: number;
  availableCash: number;
  positions: Position[];
}
