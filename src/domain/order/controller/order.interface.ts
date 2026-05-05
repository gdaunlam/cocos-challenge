import { Side } from '../../../database/migrations/entities/order.entity';

export interface CreateOrderInput {
  instrumentId: number;
  userId: number;
  side: Side;
  quantity?: number;
  amount?: number;
  price?: number;
}

export interface CreateOrderResult {
  order: {
    id: number;
    instrumentId: number;
    userId: number;
    side: Side;
    size: number;
    price: number;
    type: 'MARKET' | 'LIMIT';
    status: 'FILLED' | 'NEW' | 'CANCELLED' | 'REJECTED';
    datetime: string;
  };
}
