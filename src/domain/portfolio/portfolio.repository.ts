import { Order } from '../../database/migrations/entities/order.entity';

export abstract class PortfolioRepository {
  abstract findOrdersByUserId(userId: number): Promise<Order[]>;
  abstract findAllOrders(): Promise<Order[]>;
}
