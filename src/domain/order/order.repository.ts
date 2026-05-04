import { Order } from '../../database/migrations/entities/order.entity';

export abstract class OrderRepository {
  abstract findByUserId(userId: number): Promise<Order[]>;
  abstract findAll(): Promise<Order[]>;
  abstract save(order: Order): Promise<Order>;
}
