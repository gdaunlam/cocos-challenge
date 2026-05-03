import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('instruments')
export class Instrument {
  @PrimaryColumn()
  @ApiProperty({ example: 'USD' })
  name!: string;

  @Column()
  @ApiProperty({ example: '2024-01-01' })
  emissionDate!: string;

  @Column('decimal')
  @ApiProperty({ example: 1000000 })
  amount!: number;
}