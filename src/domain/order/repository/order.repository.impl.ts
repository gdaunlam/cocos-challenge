import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../database/migrations/entities/order.entity';

export type SaveOrderDto = Omit<Order, 'id'>;

@Injectable()
export class OrderRepositoryImpl {
  constructor(@InjectRepository(Order) private readonly repository: Repository<Order>) {}

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repository.find({ where: { userId } });
  }

  async findAll(): Promise<Order[]> {
    return this.repository.find();
  }

  async save(order: SaveOrderDto): Promise<Order> {
    return this.repository.save(order);
  }
}