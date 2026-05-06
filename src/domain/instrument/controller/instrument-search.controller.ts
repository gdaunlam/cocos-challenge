import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchInstrumentsOutput } from './instrument-search.interface';
import { InstrumentSearchService } from '../service/instrument-search.service';
import { SearchInstrumentsQueryDto } from './instrument-search.query.dto';

@ApiTags('Instruments')
@Controller('instrument')
export class InstrumentSearchController {
  constructor(private readonly instrumentSearchService: InstrumentSearchService) {}

  @Get('search')
  async search(@Query() query: SearchInstrumentsQueryDto): Promise<SearchInstrumentsOutput> {
    return this.instrumentSearchService.search(query);
  }
}
