import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class PortfolioParamsDto {
  @ApiProperty({ minimum: 1, description: 'User ID' })
  @Type(() => Number)
  @IsPositive()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  userId!: number;
}