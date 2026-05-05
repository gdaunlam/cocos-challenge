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
  BUY_NEW: (order, context) => {
    if (!context.exchanged) return;
    context.exchanged.credit -= order.size * order.price;
    context.exchanged.limit -= order.size;
  },

  BUY_FILLED: (order, context) => {
    if (!context.exchanged) return;
    context.target.debit += order.size * order.price;
    context.target.holdings += order.size;
    context.target.credit += order.size * order.price;
    context.target.limit += order.size;
    context.exchanged.debit -= order.size * order.price;
    context.exchanged.holdings -= order.size;
  },

  BUY_CANCELLED: (order, context) => {
    if (!context.exchanged) return;
    context.exchanged.credit += order.size * order.price;
    context.exchanged.limit += order.size;
  },

  BUY_REJECTED: (order, context) => {
    if (!context.exchanged) return;
    context.exchanged.credit += order.size * order.price;
    context.exchanged.limit += order.size;
  },

  SELL_NEW: (order, context) => {
    context.target.credit -= order.size * order.price;
    context.target.limit -= order.size;
  },

  SELL_FILLED: (order, context) => {
    if (!context.exchanged) return;
    context.target.debit -= order.size * order.price;
    context.target.holdings -= order.size;
    context.target.limit -= order.size;
    context.exchanged.debit += order.size * order.price;
    context.exchanged.holdings += order.size;
    context.exchanged.credit += order.size * order.price;
    context.exchanged.limit += order.size;
  },

  SELL_CANCELLED: (order, context) => {
    context.target.credit += order.size * order.price;
    context.target.limit += order.size;
  },

  SELL_REJECTED: (order, context) => {
    context.target.credit += order.size * order.price;
    context.target.limit += order.size;
  },

  CASH_IN_FILLED: (order, context) => {
    context.target.debit += order.size;
    context.target.holdings += order.size;
    context.target.credit += order.size;
    context.target.limit += order.size;
  },

  CASH_OUT_FILLED: (order, context) => {
    context.target.debit -= order.size;
    context.target.holdings -= order.size;
    context.target.credit -= order.size;
    context.target.limit -= order.size;
  }
};
