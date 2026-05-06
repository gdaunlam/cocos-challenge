import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
}
export enum Status {
  FILLED = 'FILLED',
  NEW = 'NEW',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id!: number;

  @Column()
  @ApiProperty({ example: 1 })
  instrumentId!: number;

  @Column()
  @ApiProperty({ example: 1 })
  userId!: number;

  @Column()
  @ApiProperty({ example: 10 })
  size!: number;

  @Column()
  @ApiProperty({ example: 100.5 })
  price!: number;

  @Column()
  @ApiProperty({ example: 'LIMIT', enum: OrderType })
  type!: OrderType;

  @Column()
  @ApiProperty({ example: 'BUY', enum: Side })
  side!: Side;

  @Column()
  @ApiProperty({ example: 'NEW', enum: Status })
  status!: Status;

  @Column()
  @ApiProperty({ example: '2023-07-14T10:00:00Z' })
  datetime!: string;
}
