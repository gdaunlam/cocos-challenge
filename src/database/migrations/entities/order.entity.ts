import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type Side = 'BUY' | 'SELL' | 'CASH_IN' | 'CASH_OUT';
export type Status = 'FILLED' | 'NEW' | 'CANCELLED' | 'REJECTED';
export type OrderType = 'MARKET' | 'LIMIT';

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

  @Column('decimal')
  @ApiProperty({ example: 10 })
  size!: number;

  @Column('decimal')
  @ApiProperty({ example: 100.5 })
  price!: number;

  @Column()
  @ApiProperty({ example: 'LIMIT', enum: ['MARKET', 'LIMIT'] })
  type!: OrderType;

  @Column()
  @ApiProperty({ example: 'BUY', enum: ['BUY', 'SELL', 'CASH_IN', 'CASH_OUT'] })
  side!: Side;

  @Column()
  @ApiProperty({ example: 'NEW', enum: ['FILLED', 'NEW', 'CANCELLED', 'REJECTED'] })
  status!: Status;

  @Column()
  @ApiProperty({ example: '2023-07-14T10:00:00Z' })
  datetime!: string;
}
