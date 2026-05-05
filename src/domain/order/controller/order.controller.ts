import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateOrderInput } from './order.interface';
import { OrderService } from '../service/order.service';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  async createOrder(@Body() input: CreateOrderInput) {
    return this.orderService.createOrder(input);
  }
}
