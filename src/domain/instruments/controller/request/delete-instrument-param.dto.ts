import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteInstrumentParamDto {
  @ApiProperty({ example: 'Bond A' })
  @IsNotEmpty()
  @IsString()
  name!: string;
}
