import { Order } from '../../database/entities/order.entity';
import { InstrumentStatus } from './instrument-status';

export interface StrategyContext {
  target: InstrumentStatus;
  exchanged: InstrumentStatus | null;
}

export type OrderStrategy = (
  order: Order,
  context: StrategyContext
) => void;

export const strategies: Record<string, OrderStrategy> = {
  BUY_NEW: (order: Order, context: StrategyContext) => {
    if (!context.exchanged) return;
    context.exchanged.credit -= order.size * order.price;
    context.exchanged.limit -= order.size * order.price;
  },

  BUY_FILLED: (order: Order, context: StrategyContext) => {
    if (!context.exchanged) return;
    context.target.debit += order.size * order.price;
    context.target.credit += order.size * order.price;
    context.target.holdings += order.size;
    context.target.limit += order.size;
    context.exchanged.debit -= order.size * order.price;
    context.exchanged.holdings -= order.size * order.price;
    context.exchanged.credit -= order.size * order.price;
    context.exchanged.limit -= order.size * order.price;
  },

  BUY_CANCELLED: (_order: Order, _context: StrategyContext) => {
    // No action needed
  },

  BUY_REJECTED: (_order: Order, _context: StrategyContext) => {
    // No action needed
  },

  SELL_NEW: (order: Order, context: StrategyContext) => {
    if (!context.target) return;
    context.target.credit -= order.size * order.price;
    context.target.limit -= order.size * order.price;
  },

  SELL_FILLED: (order: Order, context: StrategyContext) => {
    if (!context.exchanged) return;
    context.target.debit -= order.size * order.price;
    context.target.credit -= order.size * order.price;
    context.target.holdings -= order.size;
    context.target.limit -= order.size;
    context.exchanged.debit += order.size * order.price;
    context.exchanged.holdings += order.size * order.price;
    context.exchanged.credit += order.size * order.price;
    context.exchanged.limit += order.size * order.price;
  },

  SELL_CANCELLED: (_order: Order, _context: StrategyContext) => {
    // No action needed
  },

  SELL_REJECTED: (_order: Order, _context: StrategyContext) => {
    // No action needed
  },

  CASH_IN_FILLED: (order: Order, context: StrategyContext) => {
    context.target.debit += order.size * order.price;
    context.target.holdings += order.size * order.price;
    context.target.credit += order.size * order.price;
    context.target.limit += order.size * order.price;
  },

  CASH_OUT_FILLED: (order: Order, context: StrategyContext) => {
    context.target.debit -= order.size * order.price;
    context.target.holdings -= order.size * order.price;
    context.target.credit -= order.size * order.price;
    context.target.limit -= order.size * order.price;
  }
};
