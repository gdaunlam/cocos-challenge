import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { InstrumentsService } from '../instruments.service';
import { Instrument } from '../../../database/migrations/entities/instrument.entity';
import { CreateInstrumentRequest } from './request/create-instrument.request';
import { GetInstrumentsQueryDto } from './request/get-instruments-query.dto';
import { DeleteInstrumentParamDto } from './request/delete-instrument-param.dto';

@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'OK', type: [Instrument] })
  findAll(@Query() query: GetInstrumentsQueryDto): Promise<Instrument[]> {
    return this.instrumentsService.findAll(query.page, query.limit);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Created', type: [Instrument] })
  create(@Body() body: CreateInstrumentRequest): Promise<Instrument[]> {
    return this.instrumentsService.create(body);
  }

  @Delete(':name')
  @ApiResponse({ status: 200, description: 'OK', type: [Instrument] })
  delete(@Param() params: DeleteInstrumentParamDto): Promise<Instrument[]> {
    return this.instrumentsService.delete(params.name);
  }
}