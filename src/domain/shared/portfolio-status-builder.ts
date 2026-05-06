import { Order } from '../../database/entities/order.entity';
import { InstrumentStatus, InstrumentStatusMap, createEmptyInstrumentStatus } from './instrument-status';
import { strategies, StrategyContext } from './order-strategies';

export class PortfolioStatusBuilder {
  private instrumentMap: InstrumentStatusMap;
  private arsInstrumentId: number;

  constructor(arsInstrumentId: number) {
    this.instrumentMap = new Map();
    this.arsInstrumentId = arsInstrumentId;
  }

  private getOrCreate(instrumentId: number): InstrumentStatus {
    let status = this.instrumentMap.get(instrumentId);
    if (!status) {
      status = createEmptyInstrumentStatus();
      this.instrumentMap.set(instrumentId, status);
    }
    return status;
  }

  private buildContext(order: Order): StrategyContext {
    let target: InstrumentStatus;
    let exchanged: InstrumentStatus | null = null;
    
    if (['CASH_IN', 'CASH_OUT'].includes(order.side)) {
      target = this.getOrCreate(this.arsInstrumentId);
      return { target, exchanged };
    } else {
      target = this.getOrCreate(order.instrumentId);
      exchanged = this.getOrCreate(this.arsInstrumentId);
      return { target, exchanged };
    }
  }

  process(orders: Order[]): InstrumentStatusMap {
    const sorted = [...orders].sort((a, b) =>
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    for (const order of sorted) {
      const key = `${order.side}_${order.status}`;
      const strategy = strategies[key];
      if (!strategy) continue;

      const context = this.buildContext(order);
      strategy(order, context);
    }

    return this.instrumentMap;
  }

  getInstrumentStatus(instrumentId: number): InstrumentStatus | undefined {
    return this.instrumentMap.get(instrumentId);
  }
}
