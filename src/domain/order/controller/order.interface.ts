import { Order, Side } from '../../../database/migrations/entities/order.entity';

export interface CreateOrderInput {
  instrumentId: number;
  userId: number;
  side: Side;
  quantity?: number;
  amount?: number;
  price?: number;
}

export interface CreateOrderResult {
  order: Order;
}
