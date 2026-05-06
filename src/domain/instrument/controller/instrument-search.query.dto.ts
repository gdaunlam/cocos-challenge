import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { InstrumentType } from '../../../database/entities/instrument.entity';

export enum SearchBy {
  TICKER = 'ticker',
  NAME = 'name',
  BOTH = 'both',
}

export class SearchInstrumentsQueryDto {
  @ApiProperty({ description: 'Search query (min 3 characters)', name: 'q' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  q!: string;

  @ApiProperty({ required: false, enum: InstrumentType })
  @IsOptional()
  @IsEnum(InstrumentType)
  type?: InstrumentType;

  @ApiProperty({ required: false, enum: SearchBy, default: SearchBy.BOTH })
  @IsOptional()
  @IsEnum(SearchBy)
  searchBy?: SearchBy;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 0;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}
