import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { Order, Side } from '../../../database/entities/order.entity';

export class CreateOrderInput {
  @ApiProperty({ name: 'instrumentId' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  instrumentId!: number;

  @ApiProperty({ name: 'userId' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  userId!: number;

  @ApiProperty({ enum: Side })
  @IsNotEmpty()
  @IsEnum(Side)
  side!: Side;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}

export interface CreateOrderResult {
  order: Order;
}
