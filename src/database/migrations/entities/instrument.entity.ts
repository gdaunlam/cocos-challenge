import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type InstrumentType = 'ACCIONES' | 'MONEDA';

@Entity('instruments')
export class Instrument {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id!: number;

  @Column({ unique: true })
  @ApiProperty({ example: 'ARS' })
  ticker!: string;

  @Column()
  @ApiProperty({ example: 'Peso Argentino' })
  name!: string;

  @Column()
  @ApiProperty({ example: 'MONEDA', enum: ['ACCIONES', 'MONEDA'] })
  type!: InstrumentType;
}
