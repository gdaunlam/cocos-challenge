import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('marketdata')
export class MarketData {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id!: number;

  @Column()
  @ApiProperty({ example: 1 })
  instrumentId!: number;

  @Column('decimal')
  @ApiProperty({ example: 150.25 })
  high!: number;

  @Column('decimal')
  @ApiProperty({ example: 148.5 })
  low!: number;

  @Column('decimal')
  @ApiProperty({ example: 149.0 })
  open!: number;

  @Column('decimal')
  @ApiProperty({ example: 150.25 })
  close!: number;

  @Column('decimal')
  @ApiProperty({ example: 147.8 })
  previousClose!: number;

  @Column()
  @ApiProperty({ example: '2023-07-14' })
  datetime!: string;
}
