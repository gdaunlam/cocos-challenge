import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderInput } from './order.interface';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  async createOrder(@Body() input: CreateOrderInput) {
    return this.orderService.createOrder(input);
  }
}
