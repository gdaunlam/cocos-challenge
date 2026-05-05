import { Injectable } from '@nestjs/common';
import { PortfolioRepositoryImpl } from '../repository/portfolio.repository.impl';
import { PortfolioStatusBuilder } from '../../shared/portfolio-status-builder';
import { MarketPricesResolver } from '../../shared/market-prices-resolver';
import { cached } from '../../shared/cache';
import { InstrumentStatusMap } from '../../shared/instrument-status';
import { Position, PortfolioBody } from '../controller/portfolio.interface';
import { InstrumentRepositoryImpl } from '../../instrument/repository/instrument.repository.impl';
import { MarketDataRepositoryImpl } from '../../marketdata/repository/marketdata.repository.impl';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly portfolioRepository: PortfolioRepositoryImpl,
    private readonly instrumentRepository: InstrumentRepositoryImpl,
    private readonly marketDataRepository: MarketDataRepositoryImpl,
  ) {}

  @cached('portfolio', function() { return `portfolio:${this.userId}`; })
  async calculatePortfolio(userId: number): Promise<PortfolioBody> {
    this.userId = userId;

    const [orders, instruments, marketData] = await Promise.all([
      this.portfolioRepository.findOrdersByUserId(userId),
      this.instrumentRepository.findAll(),
      this.marketDataRepository.findAll(),
    ]);

    const arsInstrument = instruments.find(i => i.type === 'MONEDA');
    if (!arsInstrument) {
      throw new Error('ARS instrument not found');
    }

    const processor = new PortfolioStatusBuilder(arsInstrument.id);
    const instrumentMap = processor.process(orders);

    const arsStatus = instrumentMap.get(arsInstrument.id);
    const cash = arsStatus?.debit || 0;

    const positions = this.calculatePositions(instrumentMap, orders, marketData, instruments);
    const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalValue = cash + positionsValue;

    return {
      totalValue,
      availableCash: cash,
      positions
    };
  }

  private userId!: number;

  private calculatePositions(
    instrumentMap: InstrumentStatusMap,
    orders: any[],
    marketData: any[],
    instruments: any[]
  ): Position[] {
    const positions: Position[] = [];
    const latestPrices = MarketPricesResolver.getLatestPricesMap(orders, marketData);

    for (const [instrumentId, status] of instrumentMap) {
      if (status.holdings === 0) continue;
      const instrument = instruments.find((i: any) => i.id === instrumentId);
      if (!instrument || instrument.type === 'MONEDA') continue;
      const currentPrice = latestPrices.get(instrumentId);
      if (!currentPrice) continue;
      const marketValue = status.holdings * currentPrice;
      const costBasis = status.debit;
      const totalReturn = marketValue - costBasis;
      const totalReturnPercentage = costBasis !== 0 ? (totalReturn / costBasis) * 100 : 0;

      positions.push({
        ticker: instrument.ticker,
        name: instrument.name,
        quantity: status.holdings,
        marketValue,
        totalReturn,
        totalReturnPercentage
      });
    }

    return positions;
  }
}