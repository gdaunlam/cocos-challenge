import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { InstrumentsService } from '../instruments.service';
import { Instrument } from '../../../interfaces/instrument.interface';
import { CreateInstrumentRequest } from './request/create-instrument.request';

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  findAll(): Promise<Instrument[]> {
    return this.instrumentsService.findAll();
  }

  @Post()
  create(@Body() body: CreateInstrumentRequest): Promise<Instrument[]> {
    return this.instrumentsService.create(body);
  }

  @Delete(':name')
  delete(@Param('name') name: string): Promise<Instrument[]> {
    return this.instrumentsService.delete(name);
  }
}