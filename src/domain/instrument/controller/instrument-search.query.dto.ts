import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InstrumentType } from '../../../database/entities/instrument.entity';

export class SearchInstrumentsQueryDto {
  @ApiProperty({ description: 'Search query (min 3 characters)', name: 'q' })
  @IsNotEmpty()
  @IsString()
  q!: string;

  @ApiProperty({ required: false, enum: InstrumentType })
  @IsOptional()
  @IsEnum(InstrumentType)
  type?: InstrumentType;

  @ApiProperty({ required: false, enum: ['ticker', 'name', 'both'], default: 'both' })
  @IsOptional()
  @IsString()
  searchBy?: 'ticker' | 'name' | 'both';

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
