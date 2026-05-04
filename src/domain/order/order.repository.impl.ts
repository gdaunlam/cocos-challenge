import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/migrations/entities/order.entity';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderRepositoryImpl extends OrderRepository {
  constructor(@InjectRepository(Order) private readonly repository: Repository<Order>) {
    super();
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repository.find({ where: { userId } });
  }

  async findAll(): Promise<Order[]> {
    return this.repository.find();
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
