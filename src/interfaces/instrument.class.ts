import { ApiProperty } from '@nestjs/swagger';

export class Instrument {
  @ApiProperty({ example: 'Bond A' })
  name!: string;

  @ApiProperty({ example: '2024-01-01' })
  emissionDate!: string;

  @ApiProperty({ example: 1000 })
  amount!: number;
}